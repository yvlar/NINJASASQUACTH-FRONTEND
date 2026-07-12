// Variantes visuelles par jeu, associées aux `theme_key` CONTRÔLÉS de la base
// (contrainte CHECK games_theme_key_valid). Les sous-palettes (Heroes Rising,
// Burgle Jack) ne servent QUE d'accent local au jeu — jamais le header, le
// footer ni le fond principal, qui restent dans l'identité Ninja Sasquatch.
//
// RÈGLE DE SÉCURITÉ : on ne construit JAMAIS une classe Tailwind dynamiquement
// à partir d'une valeur venue de Supabase. Ce fichier est un objet statique,
// exhaustif et typé sur `GameThemeKey` — le compilateur garantit qu'il couvre
// toutes les clés, et `themeForKey` retombe sur la marque pour toute valeur
// inattendue (donnée héritée, clé nulle).
import type { GameThemeKey } from "../types/database";

export interface GameTheme {
  // Étiquette de la pastille de catégorie/accent sur la carte et la fiche.
  accentBadge: string;
  // Filet décoratif (bord supérieur de carte, barre d'accent de section).
  accentBar: string;
  // Halo de survol subtil de la carte (élévation colorée discrète).
  cardRing: string;
  // Bouton d'accent local au jeu (ex. CTA « Voir la fiche » dans le hero).
  accentButton: string;
}

// Thème de marque par défaut — accents Ninja Sasquatch (roux / forêt).
const BRAND_THEME: GameTheme = {
  accentBadge: "bg-roux/15 text-roux",
  accentBar: "border-t-roux",
  cardRing: "hover:shadow-[0_12px_20px_-8px_rgba(160,82,45,0.35)]",
  accentButton: "bg-forest text-cream",
};

// Chaque variante est écrite en toutes lettres (aucune interpolation) pour que
// Tailwind détecte les classes au build.
export const GAME_THEMES: Record<GameThemeKey, GameTheme> = {
  brand: BRAND_THEME,
  "heroes-rising": {
    accentBadge: "bg-hr-gold text-charcoal",
    accentBar: "border-t-hr-orange",
    cardRing: "hover:shadow-[0_12px_20px_-8px_rgba(255,122,0,0.45)]",
    accentButton: "bg-hr-red text-cream",
  },
  "burgle-jack": {
    accentBadge: "bg-bj-yellow text-bj-black",
    accentBar: "border-t-bj-black",
    cardRing: "hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.45)]",
    accentButton: "bg-bj-black text-bj-yellow",
  },
  "flickle-mania": BRAND_THEME,
};

// Résout un thème à partir d'une clé possiblement nulle/héritée : retombe
// toujours sur la marque, jamais d'accès dynamique à une classe.
export function themeForKey(key: GameThemeKey | null | undefined): GameTheme {
  if (key != null && key in GAME_THEMES) {
    return GAME_THEMES[key];
  }
  return BRAND_THEME;
}
