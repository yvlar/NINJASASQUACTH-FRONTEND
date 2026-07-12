// Page d'accueil localisée (/fr, /en) : synchronise la langue sur l'URL puis
// rend le site vitrine (App). La langue est portée par la route.
import { useSyncLang } from "../../i18n/useSyncLang";
import App from "../../App";
import type { Lang } from "../../i18n/context";

export default function HomePage({ lang }: { lang: Lang }) {
  useSyncLang(lang);
  return <App />;
}
