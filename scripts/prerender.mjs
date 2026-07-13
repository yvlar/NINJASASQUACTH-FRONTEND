// Orchestration du pré-rendu (Sprint 11, Partie A). Étapes :
//   1. lire les jeux PUBLIÉS via la clé publiable (jamais la service-role)
//   2. rendre chaque route en HTML (renderToString + StaticRouter, amorcé)
//   3. injecter <head> (SEO) et corps dans le gabarit dist/index.html
//   4. écrire un fichier HTML par route + sitemap.xml + robots.txt
//
// Échoue clairement si la config Supabase est présente mais qu'un jeu publié
// ne peut pas être chargé. Sans config Supabase, pré-rend l'accueil FR/EN et la
// 404 (contenu réel + métadonnées), et journalise un avertissement — les
// fiches jeux restent alors rendues côté client jusqu'à un build configuré.
//
// AUCUN secret n'est écrit dans dist/ : seule la clé publiable (publique par
// conception) est utilisée, et uniquement en mémoire au build.
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");

const DEFAULT_SITE_URL = "https://ninjasasquacth-frontend.vercel.app";

async function main() {
  const bundle = await import(
    pathToFileURL(join(ROOT, "dist-ssr", "entry-prerender.js")).href
  );
  const {
    render,
    planRoutes,
    injectPage,
    buildSitemap,
    buildRobots,
    buildMeta,
    renderHeadTags,
    normalizeSiteUrl,
    serializePrerenderData,
  } = bundle;

  const siteUrl = normalizeSiteUrl(
    process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL,
  );

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // Garde-fou de PRODUCTION : quand REQUIRE_PRERENDER_GAMES=true, le pré-rendu
  // des fiches est obligatoire. La CI générique peut rester sans Supabase (mode
  // dégradé accueil-only), mais un build de production doit ÉCHOUER si la
  // configuration manque ou si les fiches attendues ne peuvent être générées.
  const requireGames = process.env.REQUIRE_PRERENDER_GAMES === "true";
  if (requireGames && (!supabaseUrl || !supabaseKey)) {
    throw new Error(
      "REQUIRE_PRERENDER_GAMES : configuration Supabase de build obligatoire " +
        "(SUPABASE_URL / SUPABASE_ANON_KEY absente).",
    );
  }

  let games = [];
  const mediaByGame = {};

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: gameRows, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("published", true)
      .order("featured_order", { ascending: true, nullsFirst: false });

    // Échec clair : un jeu publié annoncé mais non chargeable arrête le build.
    if (gamesError) {
      throw new Error(
        `Pré-rendu impossible : lecture des jeux publiés échouée — ${gamesError.message}`,
      );
    }
    games = gameRows ?? [];

    const ids = games.map((g) => g.id);
    if (ids.length > 0) {
      const { data: mediaRows, error: mediaError } = await supabase
        .from("game_media")
        .select("*")
        .in("game_id", ids)
        .order("sort_order", { ascending: true });
      if (mediaError) {
        throw new Error(
          `Pré-rendu impossible : lecture des médias échouée — ${mediaError.message}`,
        );
      }
      for (const row of mediaRows ?? []) {
        (mediaByGame[row.game_id] ??= []).push(row);
      }
    }
    console.log(`[prerender] ${games.length} jeu(x) publié(s) chargé(s).`);

    if (requireGames) {
      // Zéro jeu alors que des jeux publiés sont attendus → erreur.
      if (games.length === 0) {
        throw new Error(
          "REQUIRE_PRERENDER_GAMES : aucun jeu publié chargé alors que des " +
            "fiches sont attendues.",
        );
      }
      // Tout jeu publié DOIT avoir un slug (sinon sa fiche n'est pas générée).
      const sansSlug = games.filter((g) => !g.slug);
      if (sansSlug.length > 0) {
        throw new Error(
          `REQUIRE_PRERENDER_GAMES : ${sansSlug.length} jeu(x) publié(s) sans ` +
            "slug — fiche impossible à pré-rendre.",
        );
      }
    }
  } else {
    console.warn(
      "[prerender] Config Supabase absente (SUPABASE_URL/ANON_KEY) : " +
        "pré-rendu de l'accueil FR/EN et de la 404 seulement. Les fiches jeux " +
        "seront rendues côté client jusqu'à un build configuré.",
    );
  }

  const template = await readFile(join(DIST, "index.html"), "utf8");
  const seed = { games, media: mediaByGame };
  // Amorce sérialisée une fois : le client la relit pour hydrater à l'identique.
  const seedJson = serializePrerenderData(seed);

  const routes = planRoutes(games);
  for (const route of routes) {
    const meta = buildMeta(route.meta, { siteUrl });
    const headHtml = renderHeadTags(meta);
    const bodyHtml = render(route.url, seed);
    const html = injectPage(template, {
      headHtml,
      bodyHtml,
      lang: meta.lang,
      seedJson,
    });
    const outPath = join(DIST, route.outFile);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    console.log(`[prerender] ${route.url} → dist/${route.outFile}`);
  }

  if (requireGames) {
    // Chaque jeu publié doit avoir produit sa fiche FR ET EN (sinon échec).
    const gameRoutes = routes.filter((r) => r.meta.kind === "game");
    const expected = games.length * 2; // FR + EN par jeu
    if (gameRoutes.length !== expected) {
      throw new Error(
        `REQUIRE_PRERENDER_GAMES : ${gameRoutes.length} fiche(s) générée(s) ` +
          `pour ${games.length} jeu(x) publié(s) (attendu ${expected}).`,
      );
    }
  }

  // Shell racine « / » : mêmes métadonnées d'accueil FR (le corps reste le
  // shell client, « / » redirige vers /fr).
  const homeMeta = buildMeta({ kind: "home", lang: "fr" }, { siteUrl });
  const rootHtml = injectPage(template, {
    headHtml: renderHeadTags(homeMeta),
    bodyHtml: "",
    lang: "fr",
    seedJson,
  });
  await writeFile(join(DIST, "index.html"), rootHtml, "utf8");

  await writeFile(join(DIST, "sitemap.xml"), buildSitemap(games, siteUrl), "utf8");
  await writeFile(join(DIST, "robots.txt"), buildRobots(siteUrl), "utf8");
  console.log("[prerender] sitemap.xml + robots.txt écrits.");
}

main().catch((err) => {
  console.error("[prerender] échec :", err);
  process.exit(1);
});
