// Appel client de l'inscription newsletter (Sprint 12, Partie H). Passe
// TOUJOURS par l'Edge Function `subscribe-kickstarter` (service-role côté
// serveur) — JAMAIS une insertion Supabase publique : la table
// newsletter_subscribers n'accepte aucune écriture depuis le navigateur.
import { supabase } from "../lib/supabase";
import type { Lang } from "../i18n/context";

export interface NewsletterPayload {
  email: string;
  locale: Lang;
  source: string;
  // Champ leurre (honeypot) : laissé vide par un humain, rempli par un bot.
  website: string;
}

// `true` seulement si l'Edge Function confirme la réception. Toute erreur
// (réseau, fonction, statut ≠ ok) renvoie `false` → l'UI n'affiche le succès
// qu'après confirmation réelle.
export async function subscribeNewsletter(
  payload: NewsletterPayload,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "subscribe-kickstarter",
      { body: payload },
    );
    if (error) return false;
    return Boolean((data as { ok?: boolean } | null)?.ok);
  } catch {
    return false;
  }
}
