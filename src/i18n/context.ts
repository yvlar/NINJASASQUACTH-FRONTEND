// Contexte de langue — fichier séparé du provider et du hook (la règle
// react-refresh/only-export-components exige que les fichiers de composants
// n'exportent que des composants).
import { createContext } from "react";

export type Lang = "fr" | "en";

export interface LanguageContextValue {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
  // Fixe la langue courante (utilisé pour synchroniser l'état sur l'URL :
  // la langue est portée par la route /fr | /en).
  setLang: (lang: Lang) => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(
  null,
);
