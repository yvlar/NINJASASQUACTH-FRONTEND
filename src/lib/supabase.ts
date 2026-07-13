// Client Supabase unique de l'application.
// Les tests mockent ce module (`vi.mock("../lib/supabase")`) : aucun test
// ne doit toucher le réseau. Les clés vivent dans l'environnement
// (`.env.local` en dev, variables Vercel en production — voir `.env.example`).
//
// Résilience (Sprint 11, Partie B) : ce module NE lance PLUS d'exception à
// l'import quand la configuration manque. Un `throw` au chargement du module
// précédait le montage React → écran blanc total (même le Header/Hero/Contact
// statiques disparaissaient). Désormais on expose `isSupabaseConfigured` et un
// client construit sur une URL de repli invalide : le site vitrine reste
// affiché, seuls les appels réseau (catalogue) échouent — proprement captés
// par les états d'erreur des hooks (`useGames`, `useGameBySlug`).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vrai seulement si les deux variables publiques sont présentes. Les
// consommateurs peuvent l'utiliser pour afficher un état dégradé explicite.
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Journalisation de développement uniquement (aucun secret) : aide le
  // développeur sans casser le rendu. Jamais en production.
  console.warn(
    "Configuration Supabase manquante : définir VITE_SUPABASE_URL et " +
      "VITE_SUPABASE_ANON_KEY (voir .env.example). Le catalogue affichera " +
      "un état d'erreur ; le reste du site vitrine reste fonctionnel.",
  );
}

// URL de repli sur un TLD réservé non résoluble (`.invalid`, RFC 2606) : le
// client se construit sans réseau, et tout appel échoue par rejet DNS — capté
// par les hooks, jamais un écran blanc.
const FALLBACK_URL = "https://supabase-non-configure.invalid";
const FALLBACK_KEY = "supabase-non-configure";

export const supabase = createClient<Database>(
  url || FALLBACK_URL,
  anonKey || FALLBACK_KEY,
);
