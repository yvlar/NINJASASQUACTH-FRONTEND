// Client Supabase unique de l'application.
// Les tests mockent ce module (`vi.mock("../lib/supabase")`) : aucun test
// ne doit toucher le réseau. Les clés vivent dans l'environnement
// (`.env.local` en dev, variables Vercel en production — voir `.env.example`).
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Configuration Supabase manquante : définir VITE_SUPABASE_URL et " +
      "VITE_SUPABASE_ANON_KEY (voir .env.example)."
  );
}

export const supabase = createClient(url, anonKey);
