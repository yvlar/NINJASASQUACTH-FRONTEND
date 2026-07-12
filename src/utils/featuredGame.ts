// Sélection du jeu vedette et détection « contenu en anglais seulement ».
// Fonctions pures, dérivées de la donnée Supabase — aucun jeu (Heroes Rising…)
// n'est codé en dur : le jeu vedette est CHOISI parmi les jeux publiés.
import type { GameRow } from "../types/database";

// Le jeu vedette : Heroes Rising prioritaire s'il existe et est publié, sinon
// le plus petit featured_order (les nuls en dernier), sinon l'ordre d'arrivée.
export function selectFeaturedGame(games: GameRow[]): GameRow | null {
  if (games.length === 0) return null;
  const heroesRising = games.filter((g) => g.theme_key === "heroes-rising");
  const pool = heroesRising.length > 0 ? heroesRising : games;
  const sorted = [...pool].sort((a, b) => {
    const ao = a.featured_order ?? Number.POSITIVE_INFINITY;
    const bo = b.featured_order ?? Number.POSITIVE_INFINITY;
    return ao - bo;
  });
  return sorted[0] ?? null;
}

const FRENCH_MARKERS = ["fr", "français", "francais", "french"];
const ENGLISH_MARKERS = ["en", "eng", "english", "anglais", "anglaise"];

// « Contenu du jeu en anglais seulement » : dérivé des langues du matériel
// saisies par l'admin (ex. Heroes Rising). Vrai si au moins une langue anglaise
// est déclarée ET aucune langue française — jamais codé en dur sur un jeu précis.
export function isEnglishOnly(game: GameRow): boolean {
  const langs = game.game_languages ?? [];
  if (langs.length === 0) return false;
  const normalized = langs.map((l) => l.trim().toLowerCase());
  const hasFrench = normalized.some((l) => FRENCH_MARKERS.includes(l));
  const hasEnglish = normalized.some((l) => ENGLISH_MARKERS.includes(l));
  return hasEnglish && !hasFrench;
}
