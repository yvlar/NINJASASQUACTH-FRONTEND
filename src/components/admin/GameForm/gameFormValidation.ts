// Validation client du formulaire de jeu (module pur, sans composant).
// Renvoie des CLÉS i18n (jamais du texte) → re-traduites au changement de
// langue. La base reste l'autorité finale (contraintes CHECK + NOT NULL) ;
// cette validation ne fait que devancer les rejets pour une UX immédiate.
import {
  REQUIRED_TEXT_FIELDS,
  type GameFormErrors,
  type GameFormValues,
} from "./gameFormTypes";

// Contraintes image (autorité = le bucket ; miroir ici pour bloquer avant upload)
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_OCTETS = 5 * 1024 * 1024;
export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// slug partageable : minuscules, chiffres et tirets simples (miroir d'un slug
// d'URL propre). Verrouille la colonne unique `slug` côté saisie.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isPositiveInt = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (trimmed === "") return true; // champ vide géré par la règle « requis »
  return /^\d+$/.test(trimmed) && Number(trimmed) > 0;
};

const isHttpUrl = (raw: string): boolean => {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function validateGameForm(
  values: GameFormValues,
  file: File | null,
): GameFormErrors {
  const errors: GameFormErrors = {};

  // 1. Champs texte requis (parité FR/EN + NOT NULL dérivés)
  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!String(values[field]).trim()) {
      errors[field] = "admin.form.errors.required";
    }
  }

  // 2. slug bien formé
  if (values.slug.trim() && !SLUG_RE.test(values.slug.trim())) {
    errors.slug = "admin.form.errors.slug";
  }

  // 3. Nombres positifs (players/durée/âge/ordre)
  for (const field of [
    "players_min",
    "players_max",
    "duration_min",
    "duration_max",
    "minimum_age",
    "featured_order",
  ] as const) {
    if (!errors[field] && !isPositiveInt(values[field])) {
      errors[field] = "admin.form.errors.positiveInt";
    }
  }

  // 4. Plages cohérentes : max >= min (miroir des CHECK de la base)
  const pMin = Number(values.players_min);
  const pMax = Number(values.players_max);
  if (
    values.players_min.trim() &&
    values.players_max.trim() &&
    !errors.players_min &&
    !errors.players_max &&
    pMax < pMin
  ) {
    errors.players_max = "admin.form.errors.playersRange";
  }
  const dMin = Number(values.duration_min);
  const dMax = Number(values.duration_max);
  if (
    values.duration_min.trim() &&
    values.duration_max.trim() &&
    !errors.duration_min &&
    !errors.duration_max &&
    dMax < dMin
  ) {
    errors.duration_max = "admin.form.errors.durationRange";
  }

  // 5. URL Kickstarter : format valide si présente ; requise si campagne
  //    live/completed (une campagne active pointe forcément quelque part)
  const ks = values.kickstarter_url.trim();
  if (ks && !isHttpUrl(ks)) {
    errors.kickstarter_url = "admin.form.errors.url";
  } else if (
    !ks &&
    (values.campaign_status === "live" ||
      values.campaign_status === "completed")
  ) {
    errors.kickstarter_url = "admin.form.errors.kickstarterRequired";
  }

  // 6. Image : type puis taille (bloque avant tout upload)
  if (file) {
    if (!IMAGE_TYPES.includes(file.type)) {
      errors.image = "admin.form.errors.imageType";
    } else if (file.size > IMAGE_MAX_OCTETS) {
      errors.image = "admin.form.errors.imageSize";
    }
  }

  return errors;
}
