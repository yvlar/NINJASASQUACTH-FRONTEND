import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, type Lang } from "./context";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

const messages: Record<Lang, unknown> = { fr, en };

export default function LanguageProvider({
  children,
  initialLang = "fr",
}: {
  children: ReactNode;
  // Langue initiale — le client garde le défaut « fr » puis useSyncLang
  // réconcilie sur l'URL ; le PRÉ-RENDU la fixe directement (pas d'effet au
  // rendu serveur) pour que /en produise bien du HTML anglais.
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string): string => {
      const result = key
        .split(".")
        .reduce<unknown>(
          (obj, part) =>
            obj != null && typeof obj === "object"
              ? (obj as Record<string, unknown>)[part]
              : undefined,
          messages[lang],
        );
      // Clé manquante (ou chemin non-feuille) → la clé elle-même, pour que
      // le trou soit visible dans l'UI (contrat verrouillé par les tests).
      return typeof result === "string" ? result : key;
    },
    [lang],
  );

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === "fr" ? "en" : "fr"));
  }, []);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const value = useMemo(
    () => ({ lang, t, toggleLang, setLang }),
    [lang, t, toggleLang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
