// Verrou du client Supabase : construit depuis l'environnement Vite, et
// RÉSILIENT à l'absence de configuration — plus jamais de `throw` à l'import
// (qui provoquait un écran blanc avant le montage React, Sprint 11 Partie B).
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("client supabase (src/lib/supabase.ts)", () => {
  it("crée le client à partir de VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://exemple.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "cle-publique-de-test");

    const mod = await import("../lib/supabase");

    expect(mod.supabase).toBeDefined();
    expect(typeof mod.supabase.from).toBe("function");
    expect(typeof mod.supabase.auth.signInWithPassword).toBe("function");
    expect(mod.isSupabaseConfigured).toBe(true);
  });

  it("ne lance JAMAIS d'exception à l'import quand l'environnement est absent", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    // Aucun throw : le module se charge, le site vitrine reste montable.
    const mod = await import("../lib/supabase");

    expect(mod.isSupabaseConfigured).toBe(false);
    // Un client existe toujours (URL de repli invalide) : ses appels réseau
    // échoueront proprement, mais l'import ne casse pas le rendu.
    expect(mod.supabase).toBeDefined();
    expect(typeof mod.supabase.from).toBe("function");
  });
});
