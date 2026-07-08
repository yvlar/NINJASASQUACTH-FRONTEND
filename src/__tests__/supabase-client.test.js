// Verrou du client Supabase : construit depuis l'environnement Vite,
// erreur explicite si la configuration manque (jamais de clé en dur).
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("client supabase (src/lib/supabase.js)", () => {
  it("crée le client à partir de VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://exemple.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "cle-publique-de-test");

    const { supabase } = await import("../lib/supabase");

    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe("function");
    expect(typeof supabase.auth.signInWithPassword).toBe("function");
  });

  it("échoue avec un message explicite si l'environnement est absent", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    await expect(import("../lib/supabase")).rejects.toThrow(
      /VITE_SUPABASE_URL/
    );
  });
});
