// Synchronise la langue du provider sur la langue portée par l'URL (route
// /fr | /en). Appelé par chaque page localisée. La mise à jour est
// conditionnelle et convergente (pas de boucle).
import { useEffect } from "react";
import { useLanguage } from "./useLanguage";
import type { Lang } from "./context";

export function useSyncLang(lang: Lang): void {
  const { lang: current, setLang } = useLanguage();
  useEffect(() => {
    if (current !== lang) setLang(lang);
  }, [current, lang, setLang]);
}
