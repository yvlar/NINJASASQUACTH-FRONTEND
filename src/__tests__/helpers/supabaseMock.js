// Factory du client Supabase mocké : garantit que les tests ne touchent
// JAMAIS le réseau. Chaque fichier de test concerné fait :
//
//   vi.mock("../lib/supabase", async () => {
//     const { makeSupabaseMock } = await import("./helpers/supabaseMock");
//     return { supabase: makeSupabaseMock() };
//   });
//
// puis pilote/inspecte le mock via les méthodes __* (le module réel
// `src/lib/supabase.js` n'est alors jamais exécuté — aucune env requise).
import { vi } from "vitest";

const CHAIN_METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "eq",
  "order",
  "single",
  "maybeSingle",
];

// Builder chaîné « thenable » : chaque méthode retourne le builder,
// `await builder` résout le résultat configuré pour la table.
function makeBuilder(getResult) {
  const builder = {};
  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve, reject) =>
    Promise.resolve(getResult()).then(resolve, reject);
  return builder;
}

export function makeSupabaseMock(initial = {}) {
  const initialState = () => ({
    session: initial.session ?? null,
    signInError: initial.signInError ?? null,
    tables: { ...(initial.tables ?? {}) },
    uploadError: initial.uploadError ?? null,
    publicUrl:
      initial.publicUrl ??
      "https://exemple.supabase.co/storage/v1/object/public/game-images/photo.webp",
  });

  let state = initialState();
  let listeners = [];
  const builders = {};

  const getBuilder = (table) => {
    if (!builders[table]) {
      builders[table] = makeBuilder(
        () => state.tables[table] ?? { data: null, error: null },
      );
    }
    return builders[table];
  };

  const emit = (event, session) => {
    for (const callback of [...listeners]) callback(event, session);
  };

  const storageBucket = {
    upload: vi.fn(async () =>
      state.uploadError
        ? { data: null, error: state.uploadError }
        : { data: { path: "photo.webp" }, error: null },
    ),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: state.publicUrl } })),
    remove: vi.fn(async () => ({ data: null, error: null })),
  };

  return {
    from: vi.fn((table) => getBuilder(table)),
    auth: {
      getSession: vi.fn(async () => ({ data: { session: state.session } })),
      onAuthStateChange: vi.fn((callback) => {
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
      signInWithPassword: vi.fn(async ({ email }) => {
        if (state.signInError) {
          return { data: { session: null }, error: state.signInError };
        }
        // comme supabase-js : le succès émet SIGNED_IN avec la session
        state.session = { user: { id: "utilisateur-test", email } };
        emit("SIGNED_IN", state.session);
        return { data: { session: state.session }, error: null };
      }),
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
    __setTable(table, result) {
      state.tables[table] = result;
    },
    __setSignInError(error) {
      state.signInError = error;
    },
    __setUploadError(error) {
      state.uploadError = error;
    },
    __emitAuthChange(session) {
      state.session = session;
      emit(session ? "SIGNED_IN" : "SIGNED_OUT", session);
    },
    __reset() {
      state = initialState();
      listeners = [];
      for (const table of Object.keys(builders)) {
        for (const method of CHAIN_METHODS) {
          builders[table][method].mockClear();
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
