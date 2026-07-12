// Lecture d'un jeu par son slug pour la fiche publique, avec ses médias.
// Gère : chargement, erreur Supabase, rejet réseau, jeu absent (notFound),
// démontage (garde `active`). La visibilité « publié seulement » pour le
// public est portée par la RLS (un anonyme ne reçoit pas les brouillons →
// aucune ligne → notFound). Le consommateur (GamePage) remonte ce hook par
// slug (clé de route) : l'état de chargement se réinitialise proprement sans
// setState synchrone dans l'effet.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GameMediaRow, GameRow } from "../types/database";

export interface UseGameBySlugResult {
  game: GameRow | null;
  media: GameMediaRow[];
  loading: boolean;
  // Erreur applicative (PostgrestError) OU rejet réseau : présence seule testée.
  error: unknown;
  notFound: boolean;
}

export function useGameBySlug(slug: string): UseGameBySlugResult {
  const [game, setGame] = useState<GameRow | null>(null);
  const [media, setMedia] = useState<GameMediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("games")
          .select("*")
          .eq("slug", slug);
        if (!active) return;
        if (fetchError) {
          setError(fetchError);
          setLoading(false);
          return;
        }
        // Le filtre serveur `.eq("slug")` est doublé côté client (ceinture et
        // bretelles avec un mock qui renvoie la table entière).
        const rows = (Array.isArray(data) ? data : []) as GameRow[];
        const found = rows.find((row) => row.slug === slug) ?? rows[0] ?? null;
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setGame(found);

        const { data: mediaData } = await supabase
          .from("game_media")
          .select("*")
          .eq("game_id", found.id)
          .order("sort_order", { ascending: true });
        if (!active) return;
        setMedia((Array.isArray(mediaData) ? mediaData : []) as GameMediaRow[]);
        setLoading(false);
      } catch (thrown) {
        // Panne réseau AVANT toute réponse (fetch rejeté) : sans ce filet,
        // l'UI resterait bloquée sur « Chargement… ».
        if (active) {
          setError(thrown);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  return { game, media, loading, error, notFound };
}
