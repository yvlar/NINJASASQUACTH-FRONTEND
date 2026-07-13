// Verrous de la logique PURE de l'Edge Function newsletter (Sprint 12,
// Partie G). Le handler Deno n'orchestre que l'IO autour de ces fonctions ;
// on teste ici la sécurité de la logique (validation, normalisation, honeypot,
// absence de fuite, limitation de fréquence).
import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  isValidEmail,
  normalizeLocale,
  normalizeSource,
  parseSubscription,
  maskEmail,
  rateLimitDecision,
  GENERIC_SUCCESS,
  CONSENT_VERSION,
  CORS_ALLOWED_HEADERS,
  parseAllowedOrigins,
  resolveAllowedOrigin,
  corsHeaders,
} from "../../supabase/functions/subscribe-kickstarter/logic";

// Corps valide minimal (consentement explicite + version) réutilisé ci-dessous.
const consented = (extra: Record<string, unknown> = {}) => ({
  email: "fan@exemple.com",
  consent: true,
  consentVersion: CONSENT_VERSION,
  ...extra,
});

describe("validation et normalisation d'email", () => {
  it("rejette un email invalide", () => {
    for (const bad of ["", "pasunemail", "a@b", "a b@c.com", "x@y."]) {
      expect(isValidEmail(normalizeEmail(bad))).toBe(false);
    }
  });

  it("normalise (trim + minuscule)", () => {
    expect(normalizeEmail("  Jimmy@Exemple.CA ")).toBe("jimmy@exemple.ca");
  });

  it("accepte un email valide normalisé", () => {
    expect(isValidEmail(normalizeEmail("Jimmy@Exemple.CA"))).toBe(true);
  });
});

describe("parseSubscription", () => {
  it("email invalide → { ok:false, reason:'invalid' }", () => {
    const r = parseSubscription(consented({ email: "nope" }));
    expect(r).toEqual({ ok: false, reason: "invalid" });
  });

  it("honeypot rempli → { ok:false, reason:'honeypot' }", () => {
    const r = parseSubscription(consented({ website: "http://spam" }));
    expect(r).toEqual({ ok: false, reason: "honeypot" });
  });

  it("email valide AVEC consentement + version → ok, source enregistrée", () => {
    const r = parseSubscription({
      email: "Fan@Exemple.com",
      locale: "en",
      source: "hero-heroes-rising",
      consent: true,
      consentVersion: CONSENT_VERSION,
    });
    expect(r).toEqual({
      ok: true,
      value: {
        email: "fan@exemple.com",
        locale: "en",
        source: "hero-heroes-rising",
        consentVersion: CONSENT_VERSION,
      },
    });
  });

  it("email valide SANS consentement → refus 'consent'", () => {
    const r = parseSubscription({ email: "fan@exemple.com" });
    expect(r).toEqual({ ok: false, reason: "consent" });
  });

  it("consent:false → refus 'consent'", () => {
    const r = parseSubscription(consented({ consent: false }));
    expect(r).toEqual({ ok: false, reason: "consent" });
  });

  it("version de consentement absente → refus 'consent'", () => {
    const r = parseSubscription({ email: "fan@exemple.com", consent: true });
    expect(r).toEqual({ ok: false, reason: "consent" });
  });

  it("version de consentement erronée → refus 'consent'", () => {
    const r = parseSubscription(consented({ consentVersion: "faux" }));
    expect(r).toEqual({ ok: false, reason: "consent" });
  });

  it("locale inconnue → repli 'fr' ; source bornée à 64 caractères", () => {
    expect(normalizeLocale("de")).toBe("fr");
    expect(normalizeSource("x".repeat(200))).toHaveLength(64);
  });
});

describe("CORS — preflight et liste blanche d'origines", () => {
  const ALLOWED = "https://ninja.example, https://preview.example";

  it("autorise les en-têtes envoyés par functions.invoke", () => {
    // authorization / x-client-info / apikey / content-type : tous requis.
    for (const h of ["authorization", "x-client-info", "apikey", "content-type"]) {
      expect(CORS_ALLOWED_HEADERS).toContain(h);
    }
  });

  it("liste blanche : ignore les entrées vides et le joker '*'", () => {
    expect(parseAllowedOrigins("https://a.example, , *, https://b.example")).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
    expect(parseAllowedOrigins("*")).toEqual([]);
    expect(parseAllowedOrigins(undefined)).toEqual([]);
  });

  it("origine autorisée → reflétée ; origine inconnue → aucun ACAO", () => {
    const allowed = parseAllowedOrigins(ALLOWED);
    expect(resolveAllowedOrigin("https://ninja.example", allowed)).toBe(
      "https://ninja.example",
    );
    expect(resolveAllowedOrigin("https://evil.example", allowed)).toBeNull();
    expect(resolveAllowedOrigin(null, allowed)).toBeNull();
  });

  it("jamais de '*' dans les en-têtes CORS produits", () => {
    const withOrigin = corsHeaders("https://ninja.example");
    expect(withOrigin["Access-Control-Allow-Origin"]).toBe("https://ninja.example");
    expect(JSON.stringify(withOrigin)).not.toContain("*");

    // Origine refusée : pas d'ACAO du tout (le navigateur bloquera).
    const denied = corsHeaders(null);
    expect(denied["Access-Control-Allow-Origin"]).toBeUndefined();
    expect(denied.Vary).toBe("Origin");
  });
});

describe("réponse générique — aucune fuite d'existence", () => {
  it("le message de succès ne contient ni l'email ni de statut « déjà inscrit »", () => {
    const serialized = JSON.stringify(GENERIC_SUCCESS).toLowerCase();
    expect(serialized).not.toContain("@");
    expect(serialized).not.toContain("existe");
    expect(serialized).not.toContain("already");
  });
});

describe("maskEmail — journalisation sûre", () => {
  it("ne révèle jamais l'email complet", () => {
    const masked = maskEmail("jimmy@exemple.com");
    expect(masked).not.toContain("jimmy");
    expect(masked).not.toContain("exemple");
    expect(masked).toBe("j***@e***");
  });
});

describe("limitation de fréquence (fenêtre glissante)", () => {
  const config = { windowMs: 3600_000, maxAttempts: 5 };

  it("autorise la première tentative (aucun enregistrement)", () => {
    const d = rateLimitDecision(1000, null, config);
    expect(d.allowed).toBe(true);
    expect(d.next.attempts).toBe(1);
  });

  it("refuse au-delà du maximum dans la fenêtre", () => {
    const record = { windowStart: 1000, attempts: 5 };
    const d = rateLimitDecision(2000, record, config);
    expect(d.allowed).toBe(false);
    expect(d.next.attempts).toBe(6);
  });

  it("réinitialise après la fenêtre", () => {
    const record = { windowStart: 1000, attempts: 5 };
    const d = rateLimitDecision(1000 + config.windowMs + 1, record, config);
    expect(d.allowed).toBe(true);
    expect(d.next.attempts).toBe(1);
  });
});
