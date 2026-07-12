// Page fiche jeu localisée : /fr/jeux/:slug et /en/games/:slug. Synchronise
// la langue sur l'URL et remonte le contenu par slug (clé) pour un état de
// chargement propre entre deux fiches.
import { useParams } from "react-router-dom";
import { useSyncLang } from "../../i18n/useSyncLang";
import GameContent from "./GameContent";
import type { Lang } from "../../i18n/context";

export default function GamePage({ lang }: { lang: Lang }) {
  useSyncLang(lang);
  const { slug } = useParams();
  return <GameContent key={slug ?? ""} slug={slug ?? ""} />;
}
