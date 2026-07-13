// Edge Function `trigger-rebuild` (Sprint 11, Partie A) — Deno.
// Reconstruit le site statique après une publication/modification admin, en
// appelant un Deploy Hook Vercel. Le secret du Deploy Hook vit UNIQUEMENT dans
// les secrets de cette fonction (VERCEL_DEPLOY_HOOK_URL) : jamais dans la base
// publique, jamais envoyé au navigateur, jamais préfixé VITE_, jamais committé.
//
// Déclenchement possible :
//   1) Database Webhook Supabase sur la table `games` (insert/update) —
//      recommandé (server-to-server, en-tête secret partagé WEBHOOK_SECRET) ;
//   2) appel authentifié depuis /admin (JWT admin vérifié via is_admin()).
//
// Garde-fous : délai minimal entre deux rebuilds (anti-rafale), gestion
// d'erreur, journalisation SANS secret.
//
// Déploiement (action utilisateur) :
//   supabase functions deploy trigger-rebuild --no-verify-jwt
//   supabase secrets set VERCEL_DEPLOY_HOOK_URL=... WEBHOOK_SECRET=...
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  shouldTriggerRebuild,
  DEFAULT_MIN_INTERVAL_MS,
} from "./logic.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEPLOY_HOOK_URL = Deno.env.get("VERCEL_DEPLOY_HOOK_URL") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Autorise l'appel : soit un webhook DB porteur du secret partagé, soit un
// utilisateur admin (JWT vérifié via is_admin()).
async function isAuthorized(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<boolean> {
  if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") === WEBHOOK_SECRET) {
    return true;
  }
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ ok: false, message: "method_not_allowed" }, 405);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  if (!(await isAuthorized(req, supabase))) {
    return json({ ok: false, message: "unauthorized" }, 401);
  }

  if (!DEPLOY_HOOK_URL) {
    // Secret non configuré : on ne divulgue rien, on journalise sans secret.
    console.error("trigger-rebuild: VERCEL_DEPLOY_HOOK_URL absent");
    return json({ ok: false, message: "not_configured" }, 500);
  }

  // Anti-rafale : dernière demande récente ? La LECTURE du journal est
  // vérifiée : en cas d'erreur, on N'APPELLE PAS le Deploy Hook (éviter une
  // rafale si l'anti-rafale est aveugle) et on répond par une erreur générique.
  const { data: last, error: readError } = await supabase
    .from("deploy_rebuilds")
    .select("requested_at")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    console.error("trigger-rebuild: lecture deploy_rebuilds", readError.code);
    return json({ ok: false, status: "error" }, 503);
  }

  const lastAt = last ? new Date(last.requested_at).getTime() : null;
  if (!shouldTriggerRebuild(Date.now(), lastAt, { minIntervalMs: DEFAULT_MIN_INTERVAL_MS })) {
    const { error: wErr } = await supabase
      .from("deploy_rebuilds")
      .insert({ outcome: "debounced" });
    if (wErr) console.error("trigger-rebuild: écriture debounced", wErr.code);
    return json({ ok: true, status: "debounced" }, 200);
  }

  try {
    // On appelle le Deploy Hook ; on ne journalise JAMAIS l'URL (secret).
    const res = await fetch(DEPLOY_HOOK_URL, { method: "POST" });
    const outcome = res.ok ? "triggered" : "error";
    const { error: wErr } = await supabase
      .from("deploy_rebuilds")
      .insert({ outcome });
    if (wErr) console.error("trigger-rebuild: écriture outcome", wErr.code);
    if (!res.ok) {
      console.error("trigger-rebuild: Deploy Hook a répondu", res.status);
      return json({ ok: false, status: "error" }, 502);
    }
    return json({ ok: true, status: "triggered" }, 200);
  } catch (err) {
    const { error: wErr } = await supabase
      .from("deploy_rebuilds")
      .insert({ outcome: "error" });
    if (wErr) console.error("trigger-rebuild: écriture error", wErr.code);
    console.error("trigger-rebuild: échec de l'appel", (err as Error).name);
    return json({ ok: false, status: "error" }, 502);
  }
});
