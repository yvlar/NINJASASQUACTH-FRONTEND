// Chemins localisés (module pur). La langue est portée par l'URL :
//   /fr, /en, /fr/jeux/:slug, /en/games/:slug. Le segment de la fiche jeu
// diffère par langue (« jeux » en FR, « games » en EN) ; le slug, lui, est
// partagé — d'où la conservation du slug lors d'un changement de langue.
import type { Lang } from "../i18n/context";

export const gamesSegment = (lang: Lang): string =>
  lang === "fr" ? "jeux" : "games";

export const homePath = (lang: Lang): string => `/${lang}`;

export const gamePath = (lang: Lang, slug: string): string =>
  `/${lang}/${gamesSegment(lang)}/${slug}`;

// Chemin équivalent dans l'autre langue, slug conservé. Sert au bouton FR/EN.
export function otherLangPath(pathname: string, current: Lang): string {
  const target: Lang = current === "fr" ? "en" : "fr";
  const frGame = pathname.match(/^\/fr\/jeux\/(.+)$/);
  if (frGame) return `/en/games/${frGame[1]}`;
  const enGame = pathname.match(/^\/en\/games\/(.+)$/);
  if (enGame) return `/fr/jeux/${enGame[1]}`;
  // page d'accueil (ou tout le reste) : simple bascule de préfixe de langue
  return homePath(target);
}
