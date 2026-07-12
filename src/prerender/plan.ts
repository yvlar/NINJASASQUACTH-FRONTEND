// Plan de pré-rendu (Sprint 11, Partie A) : la liste des routes à générer en
// HTML statique, dérivée des jeux PUBLIÉS lus au build. Module pur (aucun
// réseau, aucun IO) → testable directement.
//
// Routes générées :
//   /fr, /en                              → accueil localisé
//   /fr/jeux/:slug, /en/games/:slug       → une fiche par jeu publié
//   404                                   → vraie page 404 pré-rendue
// /admin n'est JAMAIS pré-rendu (espace privé, rendu client uniquement).
import type { GameRow } from "../types/database";
import type { MetaInput } from "../seo/buildMeta";
import { gamePath, homePath } from "../utils/routes";

export interface PlannedRoute {
  // Emplacement rendu par StaticRouter.
  url: string;
  // Chemin de sortie sous dist/.
  outFile: string;
  meta: MetaInput;
}

// URL bidon volontairement inconnue → AppRoutes rend NotFoundPage (404).
export const NOT_FOUND_URL = "/__introuvable__";

export function planRoutes(publishedGames: GameRow[]): PlannedRoute[] {
  const routes: PlannedRoute[] = [
    { url: homePath("fr"), outFile: "fr/index.html", meta: { kind: "home", lang: "fr" } },
    { url: homePath("en"), outFile: "en/index.html", meta: { kind: "home", lang: "en" } },
  ];

  for (const game of publishedGames) {
    if (!game.slug) continue; // pas de fiche partageable sans slug
    routes.push({
      url: gamePath("fr", game.slug),
      outFile: `fr/jeux/${game.slug}/index.html`,
      meta: { kind: "game", lang: "fr", game },
    });
    routes.push({
      url: gamePath("en", game.slug),
      outFile: `en/games/${game.slug}/index.html`,
      meta: { kind: "game", lang: "en", game },
    });
  }

  routes.push({
    url: NOT_FOUND_URL,
    outFile: "404.html",
    meta: { kind: "notFound", lang: "fr" },
  });

  return routes;
}
