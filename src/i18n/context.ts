// Contexte de langue — fichier séparé du provider et du hook (la règle
// react-refresh/only-export-components exige que les fichiers de composants
// n'exportent que des composants).
import { createContext } from "react";

export type Lang = "fr" | "en";

export interface LanguageContextValue {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(
  null,
);
