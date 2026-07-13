// Modèle de données du formulaire de jeu (module sans composant :
// react-refresh/only-export-components). Tout ce que le <form> saisit est une
// chaîne (les nombres et tableaux sont convertis à la construction du payload) ;
// les cases à cocher restent des booléens et les sélections des unions.
import type {
  CampaignStatus,
  GameCategory,
  GameInsert,
  GameRow,
  GameThemeKey,
} from "../../../types/database";

export interface GameFormValues {
  slug: string;
  title_fr: string;
  title_en: string;
  tagline_fr: string;
  tagline_en: string;
  short_desc_fr: string;
  short_desc_en: string;
  full_desc_fr: string;
  full_desc_en: string;
  how_to_play_fr: string;
  how_to_play_en: string;
  rules_summary_fr: string;
  rules_summary_en: string;
  category: GameCategory;
  players_min: string;
  players_max: string;
  duration_min: string;
  duration_max: string;
  minimum_age: string;
  complexity: string;
  mechanics: string; // liste séparée par des virgules
  game_languages: string; // liste séparée par des virgules
  eco: boolean;
  campaign_status: CampaignStatus;
  kickstarter_url: string;
  coming_soon: boolean;
  rules_pdf_fr: string;
  rules_pdf_en: string;
  theme_key: string; // "" ou une GameThemeKey (le <select> contraint la valeur)
  featured_order: string;
  published: boolean;
}

// Clés d'erreur = clés i18n (jamais du texte) : re-traduites au changement
// de langue. « image » couvre le fichier téléversé.
export type GameFormErrors = Partial<
  Record<keyof GameFormValues | "image", string>
>;

// Props communes aux groupes de champs (BasicInformationFields, …).
export interface FieldGroupProps {
  values: GameFormValues;
  errors: GameFormErrors;
  onText: (name: keyof GameFormValues, value: string) => void;
  onBool: (name: keyof GameFormValues, checked: boolean) => void;
  t: (key: string) => string;
}

// Champs texte obligatoires (miroir des NOT NULL + parité FR/EN de la base).
// players_min/duration_min/minimum_age alimentent les colonnes texte héritées
// players/duration/age (toujours NOT NULL), d'où leur caractère requis.
// Le slug N'EST PAS ici : il n'est requis QUE lorsque le jeu est publié (un
// brouillon peut exister sans slug) — voir validateGameForm.
export const REQUIRED_TEXT_FIELDS = [
  "title_fr",
  "title_en",
  "short_desc_fr",
  "short_desc_en",
  "full_desc_fr",
  "full_desc_en",
  "players_min",
  "duration_min",
  "minimum_age",
] as const satisfies ReadonlyArray<keyof GameFormValues>;

export const INITIAL_VALUES: GameFormValues = {
  slug: "",
  title_fr: "",
  title_en: "",
  tagline_fr: "",
  tagline_en: "",
  short_desc_fr: "",
  short_desc_en: "",
  full_desc_fr: "",
  full_desc_en: "",
  how_to_play_fr: "",
  how_to_play_en: "",
  rules_summary_fr: "",
  rules_summary_en: "",
  category: "famille",
  players_min: "",
  players_max: "",
  duration_min: "",
  duration_max: "",
  minimum_age: "",
  complexity: "",
  mechanics: "",
  game_languages: "",
  eco: true,
  campaign_status: "none",
  kickstarter_url: "",
  coming_soon: false,
  rules_pdf_fr: "",
  rules_pdf_en: "",
  theme_key: "",
  featured_order: "",
  published: true,
};

const numToStr = (n: number | null): string => (n == null ? "" : String(n));
const listToStr = (list: string[] | null): string =>
  list == null ? "" : list.join(", ");

// Pré-remplit le formulaire depuis un jeu existant (édition).
export function valuesFromGame(game: GameRow): GameFormValues {
  return {
    slug: game.slug ?? "",
    title_fr: game.title_fr,
    title_en: game.title_en,
    tagline_fr: game.tagline_fr ?? "",
    tagline_en: game.tagline_en ?? "",
    short_desc_fr: game.short_desc_fr,
    short_desc_en: game.short_desc_en,
    full_desc_fr: game.full_desc_fr,
    full_desc_en: game.full_desc_en,
    how_to_play_fr: game.how_to_play_fr ?? "",
    how_to_play_en: game.how_to_play_en ?? "",
    rules_summary_fr: game.rules_summary_fr ?? "",
    rules_summary_en: game.rules_summary_en ?? "",
    category: game.category,
    players_min: numToStr(game.players_min),
    players_max: numToStr(game.players_max),
    duration_min: numToStr(game.duration_min),
    duration_max: numToStr(game.duration_max),
    minimum_age: numToStr(game.minimum_age),
    complexity: game.complexity ?? "",
    mechanics: listToStr(game.mechanics),
    game_languages: listToStr(game.game_languages),
    eco: game.eco,
    campaign_status: game.campaign_status,
    kickstarter_url: game.kickstarter_url ?? "",
    coming_soon: game.coming_soon,
    rules_pdf_fr: game.rules_pdf_fr ?? "",
    rules_pdf_en: game.rules_pdf_en ?? "",
    theme_key: game.theme_key ?? "",
    featured_order: numToStr(game.featured_order),
    published: game.published,
  };
}

// —— Construction du payload d'insertion/mise à jour ——

const strOrNull = (s: string): string | null => {
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
};

const intOrNull = (s: string): number | null => {
  const trimmed = s.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

const listOrNull = (s: string): string[] | null => {
  const items = s
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return items.length > 0 ? items : null;
};

// Les colonnes texte héritées players/duration/age sont DÉRIVÉES des champs
// structurés (source de vérité) : le formulaire ne les saisit plus.
export function derivePlayers(min: string, max: string): string {
  const lo = min.trim();
  const hi = max.trim();
  if (lo && hi && lo !== hi) return `${lo}-${hi}`;
  return lo || hi;
}

export function deriveDuration(min: string, max: string): string {
  const lo = min.trim();
  const hi = max.trim();
  if (lo && hi && lo !== hi) return `${lo}-${hi} min`;
  return `${lo || hi} min`;
}

export function deriveAge(minimumAge: string): string {
  const a = minimumAge.trim();
  return a ? `${a}+` : "";
}

// Convertit les valeurs validées + l'URL d'image en payload prêt pour Supabase.
export function buildGamePayload(
  values: GameFormValues,
  imageUrl: string | null,
): GameInsert {
  return {
    slug: values.slug.trim(),
    title_fr: values.title_fr.trim(),
    title_en: values.title_en.trim(),
    tagline_fr: strOrNull(values.tagline_fr),
    tagline_en: strOrNull(values.tagline_en),
    short_desc_fr: values.short_desc_fr.trim(),
    short_desc_en: values.short_desc_en.trim(),
    full_desc_fr: values.full_desc_fr.trim(),
    full_desc_en: values.full_desc_en.trim(),
    how_to_play_fr: strOrNull(values.how_to_play_fr),
    how_to_play_en: strOrNull(values.how_to_play_en),
    rules_summary_fr: strOrNull(values.rules_summary_fr),
    rules_summary_en: strOrNull(values.rules_summary_en),
    category: values.category,
    players: derivePlayers(values.players_min, values.players_max),
    duration: deriveDuration(values.duration_min, values.duration_max),
    age: deriveAge(values.minimum_age),
    players_min: intOrNull(values.players_min),
    players_max: intOrNull(values.players_max),
    duration_min: intOrNull(values.duration_min),
    duration_max: intOrNull(values.duration_max),
    minimum_age: intOrNull(values.minimum_age),
    complexity: strOrNull(values.complexity),
    mechanics: listOrNull(values.mechanics),
    game_languages: listOrNull(values.game_languages),
    theme_key:
      values.theme_key === "" ? null : (values.theme_key as GameThemeKey),
    campaign_status: values.campaign_status,
    kickstarter_url: strOrNull(values.kickstarter_url),
    rules_pdf_fr: strOrNull(values.rules_pdf_fr),
    rules_pdf_en: strOrNull(values.rules_pdf_en),
    featured_order: intOrNull(values.featured_order),
    coming_soon: values.coming_soon,
    eco: values.eco,
    published: values.published,
    image_url: imageUrl,
  };
}
