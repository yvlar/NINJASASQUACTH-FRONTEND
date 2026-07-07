import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./context";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

const messages = { fr, en };

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key) =>
      key
        .split(".")
        .reduce((obj, part) => (obj == null ? obj : obj[part]), messages[lang]) ??
      key,
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
