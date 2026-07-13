// Vérification HTTP de la PRODUCTION réelle (Sprint 11.1 · durci Prompt 5).
// Contrairement à verify-dist (qui inspecte dist/ localement), ce script
// interroge un déploiement en ligne et prouve que Vercel sert bien le
// pré-rendu, redirige, renvoie une vraie 404 et pose les en-têtes de sécurité.
//
// Nouveauté (Prompt 5, item 6) : une VRAIE fiche-jeu est testée
// AUTOMATIQUEMENT. Le script lit /sitemap.xml, en extrait le premier slug
// /fr/jeux/:slug et vérifie la fiche FR *et* EN (H1, titre réel, canonical
// propre, hreflang FR/EN, JSON-LD Product/Game, amorce __PRERENDER_DATA__,
// absence de shell de chargement, absence de donnée privée). En mode strict
// (REQUIRE_PRERENDER_GAMES=true), l'absence de toute fiche est une ERREUR.
//
// Usage :
//   node scripts/verify-production.mjs https://mon-domaine
//   npm run verify:production -- https://mon-domaine [slug-fiche-connue]
// N'utilise AUCUNE donnée privée. Sortie non nulle si un contrôle échoue.
const target = (process.argv[2] || process.env.TARGET_URL || "").replace(/\/$/, "");
const knownSlug = process.argv[3] || process.env.KNOWN_SLUG || "";
const strict = process.env.REQUIRE_PRERENDER_GAMES === "true";

if (!target) {
  console.error("Usage : node scripts/verify-production.mjs <url> [slug-fiche]");
  process.exit(2);
}

const failures = [];
const ok = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// Motifs de secret / donnée privée qui ne doivent JAMAIS apparaître dans une
// page servie (réutilisés pour l'accueil et chaque fiche).
const PRIVATE_PATTERNS = [
  /service_role/i,
  /\.invalid\b/,
  /email_normalized/,
  /newsletter_subscribers/,
  /v1\/integrations\/deploy/i,
  /RATE_LIMIT_SALT/,
  /WEBHOOK_SECRET/,
];

async function get(path, redirect = "follow") {
  const res = await fetch(target + path, { redirect });
  const body = res.status < 400 ? await res.text() : "";
  return { res, body };
}

// Premier slug de fiche publié, lu depuis le sitemap (source de vérité du
// build). Retourne "" si aucune fiche n'est indexée.
async function firstGameSlug() {
  const { res, body } = await get("/sitemap.xml");
  if (res.status !== 200) return "";
  const match = body.match(/\/fr\/jeux\/([^<>/"\s]+)/);
  return match ? match[1] : "";
}

// Contrôle complet d'une fiche (FR ou EN) : le pré-rendu doit être réel.
function checkFiche(label, path, slug, langAttr) {
  return get(path).then(({ res, body }) => {
    ok(res.status === 200, `${label} ${slug} : statut ${res.status}`);
    if (res.status !== 200) return;
    // Contenu réellement pré-rendu (pas un shell client vide).
    ok(/<h1[^>]*>\s*\S/.test(body), `${label} ${slug} : <h1> réel manquant`);
    ok(body.includes(`<html lang="${langAttr}">`), `${label} ${slug} : lang ${langAttr} manquant`);
    // Canonical propre à CETTE fiche (chemin localisé + slug).
    const canonRe = new RegExp(
      `<link rel="canonical" href="[^"]*${path.replace(/[/]/g, "\\/")}"`,
    );
    ok(canonRe.test(body), `${label} ${slug} : canonical propre à la fiche manquant`);
    // hreflang FR ET EN présents (alternates linguistiques).
    ok(body.includes('hreflang="fr"'), `${label} ${slug} : hreflang FR manquant`);
    ok(body.includes('hreflang="en"'), `${label} ${slug} : hreflang EN manquant`);
    // JSON-LD Product/Game (données réelles, jamais un shell).
    ok(
      body.includes('"@type":["Product","Game"]'),
      `${label} ${slug} : JSON-LD Product/Game manquant`,
    );
    // Amorce de pré-rendu : le client hydrate à l'identique (pas de refetch visible).
    ok(
      body.includes('id="__PRERENDER_DATA__"'),
      `${label} ${slug} : amorce __PRERENDER_DATA__ manquante`,
    );
    // Aucune donnée privée / secret dans la page.
    for (const pat of PRIVATE_PATTERNS) {
      ok(!pat.test(body), `${label} ${slug} : donnée privée apparente (${pat})`);
    }
  });
}

async function main() {
  // 1. « / » redirige vers /fr (redirection HTTP, pas un shell 200).
  {
    const res = await fetch(target + "/", { redirect: "manual" });
    ok(
      [301, 302, 307, 308].includes(res.status),
      `/ ne redirige pas (statut ${res.status})`,
    );
    const loc = res.headers.get("location") || "";
    ok(/\/fr\/?$/.test(loc), `/ ne redirige pas vers /fr (location: ${loc})`);
  }

  // 2. /fr et /en servent le HTML pré-rendu localisé.
  const fr = await get("/fr");
  ok(fr.res.status === 200, `/fr statut ${fr.res.status}`);
  ok(/<h1[\s>]/.test(fr.body), "/fr : <h1> manquant");
  ok(fr.body.includes('<html lang="fr">'), "/fr : lang fr manquant");
  ok(fr.body.includes('rel="canonical"'), "/fr : canonical manquant");
  ok(fr.body.includes("hreflang="), "/fr : hreflang manquant");
  ok(fr.body.includes("application/ld+json"), "/fr : JSON-LD manquant");

  const en = await get("/en");
  ok(en.res.status === 200, `/en statut ${en.res.status}`);
  ok(en.body.includes('<html lang="en">'), "/en : lang en manquant");
  ok(/<h1[\s>]/.test(en.body), "/en : <h1> manquant");

  // 3. Fiche jeu RÉELLE, détectée automatiquement (ou slug fourni). On teste
  //    la fiche FR *et* EN. En mode strict, l'absence de fiche est une erreur.
  const slug = knownSlug || (await firstGameSlug());
  if (slug) {
    await checkFiche("fiche FR", `/fr/jeux/${slug}`, slug, "fr");
    await checkFiche("fiche EN", `/en/games/${slug}`, slug, "en");
  } else if (strict) {
    ok(false, "REQUIRE_PRERENDER_GAMES : aucune fiche jeu trouvée dans le sitemap");
  } else {
    console.warn(
      "[verify:production] avertissement : aucune fiche jeu dans le sitemap " +
        "(aucun jeu publié) — vérification des fiches ignorée.",
    );
  }

  // 4. sitemap + robots accessibles.
  ok((await get("/sitemap.xml")).res.status === 200, "sitemap.xml inaccessible");
  ok((await get("/robots.txt")).res.status === 200, "robots.txt inaccessible");

  // 5. /admin porte X-Robots-Tag noindex.
  {
    const res = await fetch(target + "/admin", { redirect: "manual" });
    const xrobots = res.headers.get("x-robots-tag") || "";
    ok(/noindex/i.test(xrobots), `/admin sans X-Robots-Tag noindex (${xrobots})`);
  }

  // 6. URL inconnue → vraie 404 (jamais une soft-404 en 200).
  {
    const res = await fetch(target + "/route-inexistante-xyz", { redirect: "manual" });
    ok(res.status === 404, `URL inconnue ne renvoie pas 404 (statut ${res.status})`);
  }

  // 7. En-têtes de sécurité présents (contrôlés sur /fr).
  const h = fr.res.headers;
  ok(!!h.get("content-security-policy"), "CSP absente");
  ok(!!h.get("strict-transport-security"), "HSTS absente");
  ok(h.get("x-content-type-options") === "nosniff", "X-Content-Type-Options absent");
  ok((h.get("x-frame-options") || "").toUpperCase() === "DENY", "X-Frame-Options absent");
  ok(!!h.get("referrer-policy"), "Referrer-Policy absente");

  // 8. Aucun secret apparent dans le HTML d'accueil servi.
  for (const pat of PRIVATE_PATTERNS) {
    ok(!pat.test(fr.body) && !pat.test(en.body), `secret/donnée privée apparente : ${pat}`);
  }

  if (failures.length > 0) {
    console.error(`[verify:production] ÉCHEC (${failures.length}) sur ${target} :`);
    for (const f of failures) console.error("  -", f);
    process.exit(1);
  }
  const ficheMsg = slug ? `fiche FR+EN « ${slug} » testée` : "aucune fiche (non strict)";
  console.log(
    `[verify:production] OK : ${target} — pré-rendu, redirection, 404 réelle, ` +
      `en-têtes présents, ${ficheMsg}.`,
  );
}

main().catch((err) => {
  console.error("[verify:production] erreur :", err.message);
  process.exit(1);
});
