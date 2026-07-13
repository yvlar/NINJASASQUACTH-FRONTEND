// Lookup i18n pur et sans React : lit une clé pointée dans les JSON de
// traduction. Utilisable côté client ET dans le script de pré-rendu Node
// (le `t()` de LanguageProvider est lié au contexte React, inutilisable au
// build). Miroir du comportement de `t` : clé manquante → la clé elle-même.
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";
import type { Lang } from "../i18n/context";

const DICTS: Record<Lang, unknown> = { fr, en };

export function lookup(lang: Lang, key: string): string {
  const parts = key.split(".");
  let node: unknown = DICTS[lang];
  for (const part of parts) {
    if (node && typeof node === "object" && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof node === "string" ? node : key;
}
