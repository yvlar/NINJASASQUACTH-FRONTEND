// Langue déduite de l'URL — fonction PURE partagée par le serveur (pré-rendu)
// et le client (langue initiale). Le premier rendu client DOIT correspondre au
// HTML serveur : sur /en, l'app démarre en anglais (jamais un flash FR→EN).
import type { Lang } from "./context";

export function langFromUrl(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "fr";
}
