// Edge Function `subscribe-kickstarter` (Sprint 12 · durci Sprint 11.1) — Deno.
// Seul chemin d'écriture de la newsletter : le navigateur n'insère JAMAIS
// directement dans Supabase (aucune policy d'insert). Cette fonction tourne
// avec la service-role (secret d'environnement, jamais exposé au client) et
// applique : CORS strict, validation serveur, consentement PROUVÉ côté serveur,
// honeypot, limitation de fréquence ATOMIQUE (RPC), gestion des doublons SANS
// fuite d'existence, réponse générique. L'email complet n'est jamais journalisé.
//
// Déploiement (action utilisateur) :
//   supabase functions deploy subscribe-kickstarter
// Secrets OBLIGATOIRES (supabase secrets set …) — aucun repli faible :
//   SUPABASE_URL (fourni par la plateforme), SUPABASE_SERVICE_ROLE_KEY (idem),
//   ALLOWED_ORIGIN (liste blanche d'origines, séparées par des virgules),
//   RATE_LIMIT_SALT (sel de hachage d'IP). Si l'un manque → erreur de config
//   générique (jamais la valeur d'un secret dans les logs).
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  parseSubscription,
  parseAllowedOrigins,
  resolveAllowedOrigin,
  corsHeaders,
  GENERIC_SUCCESS,
} from "./logic.ts";

// Fenêtre de limitation : au plus 5 tentatives par heure et par empreinte d'IP.
const RATE_LIMIT = { windowSeconds: 60 * 60, maxAttempts: 5 };

function json(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

// Empreinte d'IP (SHA-256 + sel secret) : on ne stocke jamais l'IP brute.
async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Configuration OBLIGATOIRE : aucun repli faible (« * », sel par défaut…).
// Retourne null si un secret requis manque → la fonction répond « not_configured »
// sans jamais divulguer quelle variable ni sa valeur.
function readConfig(): {
  supabaseUrl: string;
  serviceRoleKey: string;
  allowedOrigins: string[];
  salt: string;
} | null {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGIN"));
  const salt = Deno.env.get("RATE_LIMIT_SALT") ?? "";
  if (!supabaseUrl || !serviceRoleKey || allowedOrigins.length === 0 || !salt) {
    return null;
  }
  return { supabaseUrl, serviceRoleKey, allowedOrigins, salt };
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin");
  const config = readConfig();

  // Sans configuration valide, on ne pose aucun entête CORS permissif.
  if (!config) {
    console.error("subscribe-kickstarter: configuration incomplète");
    return json({ ok: false, message: "not_configured" }, 500, corsHeaders(null));
  }

  const allowOrigin = resolveAllowedOrigin(requestOrigin, config.allowedOrigins);
  const cors = corsHeaders(allowOrigin);

  // Preflight : on répond OK, mais uniquement avec un ACAO si l'origine est
  // autorisée (sinon le navigateur bloquera de lui-même l'appel réel).
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return json({ ok: false, message: "method_not_allowed" }, 405, cors);
  }
  // Origine présente mais non autorisée : refus net (pas de reflet aveugle).
  if (requestOrigin && !allowOrigin) {
    return json({ ok: false, message: "forbidden_origin" }, 403, cors);
  }

  const supabase = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Limitation de fréquence ATOMIQUE (verrou côté Postgres) : lecture,
    // fenêtre et incrément dans une seule transaction → pas de condition de
    // course. On ne poursuit JAMAIS si le limiteur est indisponible.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIp(ip, config.salt);
    const { data: allowed, error: rlError } = await supabase.rpc(
      "check_newsletter_rate_limit",
      {
        p_ip_hash: ipHash,
        p_window_seconds: RATE_LIMIT.windowSeconds,
        p_max_attempts: RATE_LIMIT.maxAttempts,
      },
    );
    if (rlError) {
      // Fail-closed : erreur du limiteur → aucune inscription, code technique seul.
      console.error("subscribe-kickstarter rate-limit RPC:", rlError.code);
      return json({ ok: false, message: "subscription.error" }, 503, cors);
    }
    if (allowed !== true) {
      // Trop de tentatives : réponse générique, aucune écriture d'abonné.
      return json(GENERIC_SUCCESS, 200, cors);
    }

    const parsed = parseSubscription(body);
    if (!parsed.ok) {
      // Honeypot → succès générique (on ignore silencieusement le bot).
      if (parsed.reason === "honeypot") return json(GENERIC_SUCCESS, 200, cors);
      // Consentement absent/invalide → refus explicite (aucune fausse preuve).
      if (parsed.reason === "consent") {
        return json({ ok: false, message: "subscription.consent" }, 400, cors);
      }
      // Email invalide → rejet explicite (message générique, sans fuite).
      return json({ ok: false, message: "subscription.invalid" }, 400, cors);
    }

    // Insertion idempotente. `consent_at` n'est écrit QU'ICI, après validation
    // serveur du consentement → aucune fausse preuve. Opt-in simple explicite :
    // statut « confirmed » (voir README : pas de double opt-in tant qu'aucun
    // courriel de confirmation n'est envoyé).
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email_normalized: parsed.value.email,
        locale: parsed.value.locale,
        source: parsed.value.source,
        status: "confirmed",
        consent_at: new Date().toISOString(),
        consent_version: parsed.value.consentVersion,
        consent_source: parsed.value.source,
      },
      { onConflict: "email_normalized", ignoreDuplicates: true },
    );

    if (error) {
      // On ne journalise jamais l'email : seulement le code d'erreur.
      console.error("subscribe-kickstarter insert error:", error.code);
      return json({ ok: false, message: "subscription.error" }, 500, cors);
    }

    // Réponse identique pour une nouvelle inscription OU un doublon.
    return json(GENERIC_SUCCESS, 200, cors);
  } catch (err) {
    console.error("subscribe-kickstarter error:", (err as Error).name);
    return json({ ok: false, message: "subscription.error" }, 500, cors);
  }
});
