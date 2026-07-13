// Validation d'un fichier de galerie (module pur, sans composant). Réutilise
// les contraintes du bucket (miroir côté saisie ; l'autorité reste le bucket
// game-images : 5 Mo, jpeg/png/webp). Renvoie une CLÉ i18n d'erreur, ou null.
import {
  IMAGE_EXTENSIONS,
  IMAGE_MAX_OCTETS,
  IMAGE_TYPES,
} from "../GameForm/gameFormValidation";

export { IMAGE_EXTENSIONS, IMAGE_MAX_OCTETS, IMAGE_TYPES };

export function validateMediaFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return "admin.media.errors.type";
  }
  if (file.size > IMAGE_MAX_OCTETS) {
    return "admin.media.errors.size";
  }
  return null;
}
