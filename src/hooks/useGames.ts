// Lecture publique des jeux : la RLS Supabase filtre `published` (le client
// ne filtre rien) — un visiteur anonyme ne reçoit que les jeux publiés.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
  // Amorce de pré-rendu : si présente, la donnée est renvoyée synchronement
  // (aucun fetch) pour que le HTML produit contienne le vrai catalogue.
  const seed = usePrerenderData();
  const [games, setGames] = useState<GameRow[]>(seed?.games ?? []);
  const [loading, setLoading] = useState(seed == null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (seed != null) return; // pré-rendu : donnée déjà en place
    let active = true;

    supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true })
      .then(
        ({ data, error: fetchError }) => {
          if (!active) return;
          if (fetchError) {
            setError(fetchError);
          } else {
            setGames(data ?? []);
          }
          setLoading(false);
        },
        // panne réseau AVANT toute réponse (fetch rejeté) : sans ce bras,
        // l'UI resterait bloquée sur « Chargement… »
        (thrown: unknown) => {
          if (!active) return;
          setError(thrown);
          setLoading(false);
        },
      );

    return () => {
      active = false;
    };
  }, [seed]);

  return { games, loading, error };
}
