// Lecture publique des jeux : la RLS Supabase filtre `published` (le client
// ne filtre rien) — un visiteur anonyme ne reçoit que les jeux publiés.
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { usePrerenderData } from "../ssr/prerenderContext";
import type { GameRow } from "../types/database";

export interface UseGamesResult {
  games: GameRow[];
  loading: boolean;
  // Erreur applicative (PostgrestError) OU rejet réseau : les consommateurs
  // ne testent que sa présence, jamais sa forme.
  error: unknown;
}

export function useGames(): UseGamesResult {
  // Amorce de pré-rendu : si présente, la donnée est affichée SYNCHRONEMENT
  // (aucun état de chargement) — c'est ce que le premier rendu client hydrate,
  // identique au HTML serveur. Puis on rafraîchit en arrière-plan.
  const seed = usePrerenderData();
  // Sans configuration Supabase et sans amorce : aucun appel réseau (pas de
  // requête vers un domaine .invalid) → erreur locale immédiate (état initial,
  // pas de setState synchrone dans l'effet).
  const notConfigured = !isSupabaseConfigured && seed == null;
  const [games, setGames] = useState<GameRow[]>(seed?.games ?? []);
  const [loading, setLoading] = useState(isSupabaseConfigured && seed == null);
  const [error, setError] = useState<unknown>(
    notConfigured ? new Error("supabase-not-configured") : null,
  );

  useEffect(() => {
    // Non configuré : l'erreur (ou l'amorce conservée) est déjà en place.
    if (!isSupabaseConfigured) return;

    let active = true;
    // Avec amorce, la requête est un rafraîchissement en arrière-plan : on
    // n'affiche pas de chargement et on CONSERVE les données du build si elle
    // échoue (pas de disparition du contenu, pas d'écran d'erreur).
    const background = seed != null;

    supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true })
      .then(
        ({ data, error: fetchError }) => {
          if (!active) return;
          if (fetchError) {
            if (!background) setError(fetchError);
          } else {
            setGames(data ?? []);
          }
          if (!background) setLoading(false);
        },
        // panne réseau AVANT toute réponse (fetch rejeté) : sans ce bras,
        // l'UI resterait bloquée sur « Chargement… »
        (thrown: unknown) => {
          if (!active) return;
          if (!background) {
            setError(thrown);
            setLoading(false);
          }
        },
      );

    return () => {
      active = false;
    };
  }, [seed]);

  return { games, loading, error };
}
