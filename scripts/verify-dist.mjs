// Vérification du dist/ pré-rendu (Sprint 11/12 · durci 11.1). Contrôle que le
// HTML PRODUIT contient réellement le contenu attendu (accueil ET fiches) ET
// qu'aucun secret / donnée privée ne fuit dans le bundle. À lancer après
// `npm run build` (étape CI).
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(fileURLToPath(new URL("..", import.meta.url)), "dist");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readAllFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await readAllFiles(full)));
    else out.push(full);
  }
  return out;
}

// Extrait les slugs de fiches attendus depuis le sitemap (source de vérité du
// build : une entrée /fr/jeux/:slug et /en/games/:slug par jeu publié).
function slugsFromSitemap(sitemap) {
  const fr = [...sitemap.matchAll(/\/fr\/jeux\/([^<>/]+)/g)].map((m) => m[1]);
  const en = [...sitemap.matchAll(/\/en\/games\/([^<>/]+)/g)].map((m) => m[1]);
  return { fr: [...new Set(fr)], en: [...new Set(en)] };
}

async function main() {
  // 1. Contenu réellement pré-rendu de l'accueil (pas seulement après
  //    hydratation). Vérifs AGNOSTIQUES aux données : un vrai <h1> + la bonne
  //    langue (le H1 exact dépend du jeu vedette éventuel).
  const fr = await readFile(join(DIST, "fr", "index.html"), "utf8");
  check(/<h1[\s>]/.test(fr), "dist/fr/index.html : <h1> manquant (contenu réel)");
  check(fr.includes('<html lang="fr">'), "dist/fr : lang fr manquant");
  check(fr.includes('<link rel="canonical"'), "dist/fr : canonical manquant");
  check(fr.includes('hreflang="x-default"'), "dist/fr : hreflang manquant");
  check(
    fr.includes('type="application/ld+json"'),
    "dist/fr : JSON-LD manquant",
  );

  const en = await readFile(join(DIST, "en", "index.html"), "utf8");
  check(/<h1[\s>]/.test(en), "dist/en/index.html : <h1> manquant (contenu réel)");
  check(en.includes('<html lang="en">'), "dist/en : lang en manquant");

  const notFound = await readFile(join(DIST, "404.html"), "utf8");
  check(notFound.includes("noindex"), "dist/404.html : noindex manquant");

  const sitemap = await readFile(join(DIST, "sitemap.xml"), "utf8");
  check(!sitemap.includes("/admin"), "sitemap.xml : /admin ne doit pas apparaître");
  const robots = await readFile(join(DIST, "robots.txt"), "utf8");
  check(robots.includes("Disallow: /admin"), "robots.txt : /admin non interdit");

  // 2. Fiches jeux réellement générées (quand des jeux publiés existent).
  const { fr: slugsFr, en: slugsEn } = slugsFromSitemap(sitemap);
  const requireGames = process.env.REQUIRE_PRERENDER_GAMES === "true";
  if (requireGames) {
    check(
      slugsFr.length > 0,
      "REQUIRE_PRERENDER_GAMES : aucune fiche attendue dans le sitemap",
    );
  }
  check(
    slugsFr.length === slugsEn.length,
    `fiches FR (${slugsFr.length}) ≠ fiches EN (${slugsEn.length})`,
  );

  for (const slug of slugsFr) {
    const path = join(DIST, "fr", "jeux", slug, "index.html");
    if (!(await exists(path))) {
      failures.push(`fiche FR manquante : ${slug}`);
      continue;
    }
    const html = await readFile(path, "utf8");
    check(/<h1[\s>]/.test(html), `fiche FR ${slug} : <h1> manquant (titre)`);
    check(
      html.includes('<link rel="canonical"'),
      `fiche FR ${slug} : canonical manquant`,
    );
    check(html.includes("hreflang="), `fiche FR ${slug} : hreflang manquant`);
    check(
      html.includes('"@type":["Product","Game"]') ||
        html.includes('"@type": ["Product", "Game"]') ||
        /"@type":\s*\["Product","Game"\]/.test(html),
      `fiche FR ${slug} : JSON-LD Product/Game manquant`,
    );
  }
  for (const slug of slugsEn) {
    const path = join(DIST, "en", "games", slug, "index.html");
    check(await exists(path), `fiche EN manquante : ${slug}`);
  }

  // 3. Aucune route brouillon ne fuit : les seuls dossiers de fiches présents
  //    correspondent aux slugs publiés du sitemap.
  const frJeux = join(DIST, "fr", "jeux");
  if (await exists(frJeux)) {
    for (const entry of await readdir(frJeux, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        check(
          slugsFr.includes(entry.name),
          `fiche FR hors sitemap (brouillon ?) : ${entry.name}`,
        );
      }
    }
  }

  // 4. Domaine configuré : quand SITE_URL est fourni, les canonical l'utilisent
  //    (pas le repli Vercel).
  const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (siteUrl) {
    const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    check(
      fr.includes(`https://${host}`),
      `dist/fr : canonical n'utilise pas le domaine configuré (${host})`,
    );
    check(
      !fr.includes("ninjasasquacth-frontend.vercel.app") || host.includes("vercel.app"),
      "dist/fr : repli Vercel présent malgré un SITE_URL configuré",
    );
  }

  // 5. Aucun secret dans AUCUN fichier livré (JS compris).
  const secretPatterns = [
    /service_role/i,
    /SUPABASE_SERVICE_ROLE/i,
    /v1\/integrations\/deploy/i, // URL de Deploy Hook Vercel
    /RATE_LIMIT_SALT/,
    /WEBHOOK_SECRET/,
  ];
  // Aucune donnée privée ni URL .invalid dans le CONTENU livré (HTML pré-rendu,
  // sitemap, robots). Le repli .invalid du client (constante JS neutre, jamais
  // requêtée grâce à isSupabaseConfigured) n'a pas à figurer dans les pages.
  const htmlOnlyPatterns = [
    /\.invalid\b/,
    /email_normalized/,
    /newsletter_subscribers/,
    /consent_at/,
  ];
  for (const file of await readAllFiles(DIST)) {
    const content = await readFile(file, "utf8").catch(() => "");
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        failures.push(`Secret dans ${file} : ${pattern}`);
      }
    }
    if (/\.(html|xml|txt)$/.test(file)) {
      for (const pattern of htmlOnlyPatterns) {
        if (pattern.test(content)) {
          failures.push(`Donnée privée/.invalid dans ${file} : ${pattern}`);
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error("[verify-dist] ÉCHEC :");
    for (const f of failures) console.error("  -", f);
    process.exit(1);
  }
  console.log(
    `[verify-dist] OK : accueil + ${slugsFr.length} fiche(s) pré-rendue(s), ` +
      "aucun secret livré.",
  );
}

main().catch((err) => {
  console.error("[verify-dist] erreur :", err);
  process.exit(1);
});
