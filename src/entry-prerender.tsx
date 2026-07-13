// Cible du bundle SSR (`vite build --ssr`). Regroupe tout ce dont le script de
// pré-rendu Node (scripts/prerender.mjs) a besoin, pour un unique import du
// bundle compilé — évite d'exécuter du TypeScript/JSX brut sous Node.
export { render, langFromUrl } from "./entry-server";
export { serializePrerenderData } from "./ssr/serializeSeed";
export { planRoutes, NOT_FOUND_URL } from "./prerender/plan";
export { injectPage } from "./prerender/inject";
export { buildSitemap, buildRobots } from "./prerender/sitemap";
export { renderHeadTags } from "./seo/renderHead";
export { buildMeta } from "./seo/buildMeta";
export { normalizeSiteUrl } from "./seo/config";
