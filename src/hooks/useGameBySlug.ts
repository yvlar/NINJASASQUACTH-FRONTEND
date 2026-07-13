// Lecture d'un jeu par son slug pour la fiche publique, avec ses médias.
// Gère : chargement, erreur Supabase, rejet réseau, jeu absent (notFound),
// démontage (garde `active`). La visibilité « publié seulement » pour le
// public est portée par la RLS (un anonyme ne reçoit pas les brouillons →
// aucune ligne → notFound). Le consommateur (GamePage) remonte ce hook par
// slug (clé de route) : l'état de chargement se réinitialise proprement sans
// setState synchrone dans l'effet.
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { usePrerenderData } from "../ssr/prerenderContext";
import type { GameMediaRow, GameRow } from "../types/database";

export interface UseGameBySlugResult {
  game: GameRow | null;
  media: GameMediaRow[];
  loading: boolean;
  // Erreurs SÉPARÉES : une panne de la galerie (game_media) ne doit pas casser
  // toute la fiche. gameError = échec de lecture du jeu (fiche indisponible) ;
  // mediaError = échec de la galerie seule (fiche visible, galerie en erreur).
  gameError: unknown;
  mediaError: unknown;
  notFound: boolean;
}

export function useGameBySlug(slug: string): UseGameBySlugResult {
  // Amorce de pré-rendu : le jeu de CE slug y est-il présent ? Seul ce cas
  // affiche le contenu SYNCHRONEMENT (hydratation à l'identique). Une
  // navigation client vers un slug absent de l'amorce (jeu publié après le
  // build) NE fait PAS confiance à l'amorce et va chercher la donnée fraîche.
  const seed = usePrerenderData();
  const seededGame = seed?.games.find((row) => row.slug === slug) ?? null;
  const hasSeedForSlug = seed != null && seededGame != null;
  // Non configuré et slug non amorcé : erreur locale immédiate (état initial),
  // aucun appel réseau (.invalid).
  const notConfigured = !isSupabaseConfigured && !hasSeedForSlug;

  const [game, setGame] = useState<GameRow | null>(seededGame);
  const [media, setMedia] = useState<GameMediaRow[]>(
    hasSeedForSlug ? (seed.media[seededGame.id] ?? []) : [],
  );
  const [loading, setLoading] = useState(isSupabaseConfigured && !hasSeedForSlug);
  const [gameError, setGameError] = useState<unknown>(
    notConfigured ? new Error("supabase-not-configured") : null,
  );
  const [mediaError, setMediaError] = useState<unknown>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Non configuré : l'erreur (ou l'amorce conservée) est déjà en place.
    if (!isSupabaseConfigured) return;
    let active = true;
    // Slug amorcé → rafraîchissement en arrière-plan : ni chargement affiché,
    // ni disparition du contenu si la requête échoue.
    const background = hasSeedForSlug;

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("games")
          .select("*")
          .eq("slug", slug);
        if (!active) return;
        if (fetchError) {
          if (!background) {
            setGameError(fetchError);
            setLoading(false);
          }
          return; // arrière-plan : on conserve l'amorce
        }
        // Le filtre serveur `.eq("slug")` est doublé côté client (ceinture et
        // bretelles avec un mock qui renvoie la table entière).
        const rows = (Array.isArray(data) ? data : []) as GameRow[];
        const found = rows.find((row) => row.slug === slug) ?? rows[0] ?? null;
        if (!found) {
          if (!background) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        setGame(found);
        setNotFound(false);
        if (!background) setLoading(false);

        // Galerie : erreur ISOLÉE. La fiche reste visible ; seule la zone
        // galerie signalera le problème (mediaError).
        const { data: mediaData, error: mediaFetchError } = await supabase
          .from("game_media")
          .select("*")
          .eq("game_id", found.id)
          .order("sort_order", { ascending: true });
        if (!active) return;
        if (mediaFetchError) {
          setMediaError(mediaFetchError);
        } else {
          setMedia((Array.isArray(mediaData) ? mediaData : []) as GameMediaRow[]);
          setMediaError(null);
        }
      } catch (thrown) {
        // Panne réseau AVANT toute réponse (fetch rejeté) : sans ce filet,
        // l'UI resterait bloquée sur « Chargement… ».
        if (active && !background) {
          setGameError(thrown);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug, seed, hasSeedForSlug]);

  return { game, media, loading, gameError, mediaError, notFound };
}
