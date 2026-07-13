// Logique PURE de l'inscription newsletter (Sprint 12, Parties G/H). Aucune
// dépendance Deno/Supabase → testable en Vitest. Le handler Deno (index.ts)
// n'orchestre que l'IO (requête, DB service-role) autour de ces fonctions.
//
// Principes de sécurité :
//  - validation serveur de l'email (jamais faire confiance au client)
//  - normalisation (trim + minuscule) → unicité insensible à la casse
//  - honeypot : un champ leurre rempli = bot → succès générique, rien d'écrit
//  - réponse TOUJOURS générique : ne révèle jamais si l'adresse existe déjà
//  - on ne journalise jamais l'email complet (voir maskEmail)

export type Locale = "fr" | "en";

// Version de consentement STABLE : preuve horodatée de l'opt-in explicite.
// Elle est versionnée pour tracer quel libellé de consentement l'abonné a
// accepté (si le texte change, la version change). Le client DOIT renvoyer
// exactement cette valeur ; le serveur refuse toute autre valeur ou l'absence.
export const CONSENT_VERSION = "newsletter-v1-2026-07";

export interface ParsedSubscription {
  email: string;
  locale: Locale;
  source: string;
  consentVersion: string;
}

export type ParseResult =
  | { ok: true; value: ParsedSubscription }
  // `consent` : consentement absent/faux OU version manquante → refus explicite
  // (jamais de fausse preuve de consentement écrite en base).
  | { ok: false; reason: "invalid" | "honeypot" | "consent" };

// Validation raisonnable (pas d'ambition RFC 5322 complète) : un local, un @,
// un domaine avec point, sans espace.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function normalizeLocale(raw: unknown): Locale {
  return raw === "en" ? "en" : "fr";
}

// Borne la source à une valeur courte et sûre (défaut : chaîne vide).
export function normalizeSource(raw: unknown): string {
  return typeof raw === "string" ? raw.slice(0, 64) : "";
}

// Parse et valide le corps de requête. Le champ leurre est `website`.
// Le CONSENTEMENT est vérifié CÔTÉ SERVEUR : `consent === true` ET une
// `consentVersion` égale à la version attendue. React ne fait qu'ébaucher la
// case ; la preuve de consentement n'est écrite en base qu'après cette
// validation serveur (aucune fausse preuve possible).
export function parseSubscription(body: unknown): ParseResult {
  const b = (body ?? {}) as Record<string, unknown>;

  // Honeypot : un humain laisse ce champ vide ; un bot le remplit.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const rawEmail = typeof b.email === "string" ? b.email : "";
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return { ok: false, reason: "invalid" };
  }

  // Consentement obligatoire : booléen strictement `true` ET version attendue.
  // Toute autre forme (absent, false, version manquante/erronée) → refus.
  if (b.consent !== true || b.consentVersion !== CONSENT_VERSION) {
    return { ok: false, reason: "consent" };
  }

  return {
    ok: true,
    value: {
      email,
      locale: normalizeLocale(b.locale),
      source: normalizeSource(b.source),
      consentVersion: CONSENT_VERSION,
    },
  };
}

// Masque l'email pour une journalisation sûre : « j***@e***.com » — jamais en
// clair. Utilisé uniquement pour le debug ; idéalement on ne logge rien.
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const head = local[0] ?? "*";
  return `${head}***@${domain[0] ?? "*"}***`;
}

// Réponse générique de succès : identique pour une nouvelle inscription, un
// doublon ou un honeypot → aucune fuite d'existence.
export const GENERIC_SUCCESS = {
  ok: true as const,
  message: "subscription.received",
};

// ——— CORS (décision pure, testable) ———
//
// Le preflight du client Supabase (`functions.invoke`) envoie au minimum
// authorization / x-client-info / apikey / content-type : tous doivent être
// autorisés sinon OPTIONS échoue et l'inscription est impossible.
export const CORS_ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type";
export const CORS_ALLOWED_METHODS = "POST, OPTIONS";

// Découpe ALLOWED_ORIGIN en liste blanche. On rejette explicitement « * » :
// jamais de joker en production (le refléter reviendrait à tout autoriser).
export function parseAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0 && o !== "*");
}

// N'autorise QUE si l'origine de la requête figure dans la liste blanche. On ne
// reflète jamais aveuglément l'origine reçue (sinon n'importe quel site
// pourrait appeler la fonction avec les cookies/entêtes du visiteur).
export function resolveAllowedOrigin(
  requestOrigin: string | null,
  allowedOrigins: string[],
): string | null {
  if (!requestOrigin) return null;
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

// Entêtes CORS ; Access-Control-Allow-Origin n'est posé QUE pour une origine
// autorisée (jamais « * », jamais une origine inconnue). `Vary: Origin` évite
// qu'un cache serve la mauvaise réponse à une autre origine.
export function corsHeaders(allowOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS,
    "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
    Vary: "Origin",
  };
  if (allowOrigin) headers["Access-Control-Allow-Origin"] = allowOrigin;
  return headers;
}

// ——— Limitation de fréquence (décision pure) ———

export interface RateLimitRecord {
  windowStart: number; // epoch ms
  attempts: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  next: RateLimitRecord;
}

// Fenêtre glissante simple : au-delà de `maxAttempts` dans `windowMs`, on
// refuse. Pure → testable ; le handler persiste `next` (par empreinte d'IP).
export function rateLimitDecision(
  now: number,
  record: RateLimitRecord | null,
  config: RateLimitConfig,
): RateLimitDecision {
  if (record == null || now - record.windowStart >= config.windowMs) {
    return { allowed: true, next: { windowStart: now, attempts: 1 } };
  }
  const attempts = record.attempts + 1;
  return {
    allowed: attempts <= config.maxAttempts,
    next: { windowStart: record.windowStart, attempts },
  };
}
