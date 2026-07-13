// Edge Function `subscribe-kickstarter` (Sprint 12, Parties G/H) — Deno.
// Seul chemin d'écriture de la newsletter : le navigateur n'insère JAMAIS
// directement dans Supabase (aucune policy d'insert). Cette fonction tourne
// avec la service-role (secret d'environnement, jamais exposé au client) et
// applique : validation serveur, normalisation, honeypot, limitation de
// fréquence, gestion des doublons SANS fuite d'existence, preuve de
// consentement, réponse générique. L'email complet n'est jamais journalisé.
//
// Déploiement (action utilisateur) :
//   supabase functions deploy subscribe-kickstarter
// Secrets à poser (supabase secrets set …) : SERVICE_ROLE_KEY est fourni par
// la plateforme sous SUPABASE_SERVICE_ROLE_KEY ; définir aussi ALLOWED_ORIGIN
// et RATE_LIMIT_SALT.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  parseSubscription,
  rateLimitDecision,
  GENERIC_SUCCESS,
  type RateLimitRecord,
} from "./logic.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const RATE_LIMIT_SALT = Deno.env.get("RATE_LIMIT_SALT") ?? "ns-games";

const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxAttempts: 5 };

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

// Empreinte d'IP (SHA-256 + sel) : on ne stocke jamais l'IP brute.
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`${RATE_LIMIT_SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, message: "method_not_allowed" }, 405);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Limitation de fréquence par empreinte d'IP (fenêtre glissante).
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIp(ip);
    const { data: rlRow } = await supabase
      .from("newsletter_rate_limits")
      .select("window_start, attempts")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    const record: RateLimitRecord | null = rlRow
      ? {
          windowStart: new Date(rlRow.window_start).getTime(),
          attempts: rlRow.attempts,
        }
      : null;
    const decision = rateLimitDecision(Date.now(), record, RATE_LIMIT);
    await supabase.from("newsletter_rate_limits").upsert({
      ip_hash: ipHash,
      window_start: new Date(decision.next.windowStart).toISOString(),
      attempts: decision.next.attempts,
    });
    if (!decision.allowed) {
      // Trop de tentatives : réponse générique, aucune écriture d'abonné.
      return json(GENERIC_SUCCESS, 200);
    }

    const parsed = parseSubscription(body);
    if (!parsed.ok) {
      // Honeypot → succès générique (on ignore silencieusement le bot).
      if (parsed.reason === "honeypot") return json(GENERIC_SUCCESS, 200);
      // Email invalide → rejet explicite (message générique, sans fuite).
      return json({ ok: false, message: "subscription.invalid" }, 400);
    }

    // Insertion idempotente : un doublon ne lève pas d'erreur et ne révèle
    // rien (on ignore le conflit sur email_normalized).
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email_normalized: parsed.value.email,
        locale: parsed.value.locale,
        source: parsed.value.source,
        status: "pending",
        consent_at: new Date().toISOString(),
      },
      { onConflict: "email_normalized", ignoreDuplicates: true },
    );

    if (error) {
      // On ne journalise jamais l'email : seulement le code d'erreur.
      console.error("subscribe-kickstarter insert error:", error.code);
      return json({ ok: false, message: "subscription.error" }, 500);
    }

    // Réponse identique pour une nouvelle inscription OU un doublon.
    return json(GENERIC_SUCCESS, 200);
  } catch (err) {
    console.error("subscribe-kickstarter error:", (err as Error).name);
    return json({ ok: false, message: "subscription.error" }, 500);
  }
});
