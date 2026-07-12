// Factory du client Supabase mocké : garantit que les tests ne touchent
// JAMAIS le réseau. Chaque fichier de test concerné fait :
//
//   vi.mock("../lib/supabase", async () => {
//     const { makeSupabaseMock } = await import("./helpers/supabaseMock");
//     return { supabase: makeSupabaseMock() };
//   });
//
// puis pilote/inspecte le mock via les méthodes __* après un unique cast
// `as unknown as SupabaseMock` (le module réel `src/lib/supabase.ts`
// n'est alors jamais exécuté — aucune env requise).
import { vi, type Mock } from "vitest";

const CHAIN_METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "eq",
  "order",
  "single",
  "maybeSingle",
] as const;

type ChainMethod = (typeof CHAIN_METHODS)[number];

// Résultat configuré pour une table : soit une réponse PostgREST simulée
// `{ data, error }`, soit `{ reject }` (panne réseau avant toute réponse).
export interface TableResult {
  data?: unknown;
  error?: unknown;
  reject?: unknown;
}

// Session minimale au format supabase-js (seuls champs lus par l'app).
export interface MockSession {
  user: { id: string; email?: string };
}

type AuthListener = (event: string, session: MockSession | null) => void;

export type SupabaseMockBuilder = Record<ChainMethod, Mock> & {
  then: (
    onFulfilled?: (value: unknown) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

export interface SupabaseMockInit {
  session?: MockSession | null;
  signInError?: unknown;
  tables?: Record<string, TableResult>;
  uploadError?: unknown;
  publicUrl?: string;
}

// Builder chaîné « thenable » : chaque méthode retourne le builder,
// `await builder` résout le résultat configuré pour la table.
// Un résultat `{ reject: <erreur> }` fait REJETER la promesse (panne réseau
// avant toute réponse PostgREST), contrairement à `{ data, error }` qui
// résout avec une erreur applicative.
function makeBuilder(getResult: () => TableResult): SupabaseMockBuilder {
  const builder = {} as SupabaseMockBuilder;
  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (onFulfilled, onRejected) => {
    const result = getResult();
    if (result && result.reject) {
      return Promise.reject(result.reject).then(onFulfilled, onRejected);
    }
    return Promise.resolve(result).then(onFulfilled, onRejected);
  };
  return builder;
}

// État interne mutable du mock (piloté par les méthodes __*).
interface MockState {
  session: MockSession | null;
  signInError: unknown;
  tables: Record<string, TableResult>;
  uploadError: unknown;
  removeError: unknown;
  publicUrl: string;
}

export function makeSupabaseMock(initial: SupabaseMockInit = {}) {
  const initialState = (): MockState => ({
    session: initial.session ?? null,
    signInError: initial.signInError ?? null,
    tables: { ...(initial.tables ?? {}) },
    uploadError: initial.uploadError ?? null,
    removeError: null,
    publicUrl:
      initial.publicUrl ??
      "https://exemple.supabase.co/storage/v1/object/public/game-images/photo.webp",
  });

  let state = initialState();
  let listeners: AuthListener[] = [];
  const builders: Record<string, SupabaseMockBuilder> = {};

  const getBuilder = (table: string): SupabaseMockBuilder => {
    const existing = builders[table];
    if (existing) return existing;
    const created = makeBuilder(
      () => state.tables[table] ?? { data: null, error: null },
    );
    builders[table] = created;
    return created;
  };

  const emit = (event: string, session: MockSession | null) => {
    for (const callback of [...listeners]) callback(event, session);
  };

  const storageBucket = {
    upload: vi.fn(async () =>
      state.uploadError
        ? { data: null, error: state.uploadError }
        : { data: { path: "photo.webp" }, error: null },
    ),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: state.publicUrl } })),
    remove: vi.fn(async () =>
      state.removeError
        ? { data: null, error: state.removeError }
        : { data: null, error: null },
    ),
  };

  return {
    from: vi.fn((table: string) => getBuilder(table)),
    auth: {
      getSession: vi.fn(async () => ({ data: { session: state.session } })),
      onAuthStateChange: vi.fn((callback: AuthListener) => {
        listeners.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(() => {
                listeners = listeners.filter((l) => l !== callback);
              }),
            },
          },
        };
      }),
      signInWithPassword: vi.fn(
        async ({ email }: { email: string; password: string }) => {
          if (state.signInError) {
            return { data: { session: null }, error: state.signInError };
          }
          // comme supabase-js : le succès émet SIGNED_IN avec la session
          state.session = { user: { id: "utilisateur-test", email } };
          emit("SIGNED_IN", state.session);
          return { data: { session: state.session }, error: null };
        },
      ),
      signOut: vi.fn(async () => {
        state.session = null;
        emit("SIGNED_OUT", null);
        return { error: null };
      }),
    },
    storage: { from: vi.fn(() => storageBucket) },

    // ——— pilotage/inspection depuis les tests ———
    __builders: builders,
    __storageBucket: storageBucket,
    __setTable(table: string, result: TableResult) {
      state.tables[table] = result;
    },
    __setSignInError(error: unknown) {
      state.signInError = error;
    },
    __setUploadError(error: unknown) {
      state.uploadError = error;
    },
    __setRemoveError(error: unknown) {
      state.removeError = error;
    },
    __emitAuthChange(session: MockSession | null) {
      state.session = session;
      emit(session ? "SIGNED_IN" : "SIGNED_OUT", session);
    },
    __reset() {
      state = initialState();
      listeners = [];
      for (const builder of Object.values(builders)) {
        for (const method of CHAIN_METHODS) {
          builder[method].mockClear();
        }
      }
      for (const fn of [
        storageBucket.upload,
        storageBucket.getPublicUrl,
        storageBucket.remove,
      ]) {
        fn.mockClear();
      }
    },
  };
}

// Type du mock complet : les tests castent l'import `supabase` une seule
// fois (`as unknown as SupabaseMock`) pour accéder aux méthodes __*.
export type SupabaseMock = ReturnType<typeof makeSupabaseMock>;
