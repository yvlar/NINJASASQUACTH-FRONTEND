import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, type Lang } from "./context";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

const messages: Record<Lang, unknown> = { fr, en };

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>("fr");

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
    setLang((current) => (current === "fr" ? "en" : "fr"));
  }, []);

  const value = useMemo(() => ({ lang, t, toggleLang }), [lang, t, toggleLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
