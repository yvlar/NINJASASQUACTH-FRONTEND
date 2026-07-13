// Verrou des headers de sécurité Vercel (Sprint 11, Partie F). On valide la
// configuration `vercel.json` de façon statique (la vérification HTTP réelle
// se fait en preview/production — voir README). La CSP n'autorise QUE ce qui
// est réellement utilisé (self, Supabase, Google Fonts, Storage).
import { describe, it, expect } from "vitest";
// Import direct du JSON (moduleResolution bundler) : pas de dépendance Node.
import vercelConfig from "../../vercel.json";

const config = vercelConfig as {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

function headersFor(source: string): Record<string, string> {
  const entry = config.headers.find((h) => h.source === source);
  const out: Record<string, string> = {};
  for (const h of entry?.headers ?? []) out[h.key] = h.value;
  return out;
}

describe("vercel.json — headers de sécurité", () => {
  const global = headersFor("/(.*)");

  it("conserve la réécriture SPA (deep-link /admin en prod)", () => {
    expect(config.rewrites).toEqual([
      { source: "/(.*)", destination: "/index.html" },
    ]);
  });

  it("pose les headers de durcissement attendus", () => {
    expect(global["Strict-Transport-Security"]).toContain("max-age=");
    expect(global["X-Content-Type-Options"]).toBe("nosniff");
    expect(global["X-Frame-Options"]).toBe("DENY");
    expect(global["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(global["Permissions-Policy"]).toBeDefined();
  });

  it("CSP : autorise self, Supabase et Google Fonts, protège le cadrage", () => {
    const csp = global["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self'");
    // Supabase (REST/Auth/Storage/Realtime)
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("wss://*.supabase.co");
    // Google Fonts (encore utilisées via <link> dans index.html)
    expect(csp).toContain("https://fonts.googleapis.com");
    expect(csp).toContain("https://fonts.gstatic.com");
    // Ne casse pas le pré-rendu/JSON-LD : pas besoin de script inline exécuté
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("/admin porte un X-Robots-Tag noindex", () => {
    expect(headersFor("/admin")["X-Robots-Tag"]).toContain("noindex");
    expect(headersFor("/admin/(.*)")["X-Robots-Tag"]).toContain("noindex");
  });
});
