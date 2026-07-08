// Lecture publique des jeux : la RLS Supabase filtre `published` (le client
// ne filtre rien) — un visiteur anonyme ne reçoit que les jeux publiés.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) {
          setError(fetchError);
        } else {
          setGames(data ?? []);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { games, loading, error };
}
