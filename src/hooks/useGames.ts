// Lecture publique des jeux : la RLS Supabase filtre `published` (le client
// ne filtre rien) — un visiteur anonyme ne reçoit que les jeux publiés.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GameRow } from "../types/database";

export interface UseGamesResult {
  games: GameRow[];
  loading: boolean;
  // Erreur applicative (PostgrestError) OU rejet réseau : les consommateurs
  // ne testent que sa présence, jamais sa forme.
  error: unknown;
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
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
  }, []);

  return { games, loading, error };
}
