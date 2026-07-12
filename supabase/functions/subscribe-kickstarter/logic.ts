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

export interface ParsedSubscription {
  email: string;
  locale: Locale;
  source: string;
}

export type ParseResult =
  | { ok: true; value: ParsedSubscription }
  | { ok: false; reason: "invalid" | "honeypot" };

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

  return {
    ok: true,
    value: {
      email,
      locale: normalizeLocale(b.locale),
      source: normalizeSource(b.source),
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
