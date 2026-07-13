// Vérification HTTP de la PRODUCTION réelle (Sprint 11.1). Contrairement à
// verify-dist (qui inspecte dist/ localement), ce script interroge un
// déploiement en ligne et prouve que Vercel sert bien le pré-rendu, redirige,
// renvoie une vraie 404 et pose les en-têtes de sécurité.
//
// Usage :
//   node scripts/verify-production.mjs https://mon-domaine
//   npm run verify:production -- https://mon-domaine [slug-fiche-connue]
// N'utilise AUCUNE donnée privée. Sortie non nulle si un contrôle échoue.
const target = (process.argv[2] || process.env.TARGET_URL || "").replace(/\/$/, "");
const knownSlug = process.argv[3] || process.env.KNOWN_SLUG || "";

if (!target) {
  console.error("Usage : node scripts/verify-production.mjs <url> [slug-fiche]");
  process.exit(2);
}

const failures = [];
const ok = (cond, msg) => {
  if (!cond) failures.push(msg);
};

async function get(path, redirect = "follow") {
  const res = await fetch(target + path, { redirect });
  const body = res.status < 400 ? await res.text() : "";
  return { res, body };
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

  // 3. Fiche jeu connue (optionnelle) : contient un titre.
  if (knownSlug) {
    const fiche = await get(`/fr/jeux/${knownSlug}`);
    ok(fiche.res.status === 200, `fiche /fr/jeux/${knownSlug} statut ${fiche.res.status}`);
    ok(/<h1[\s>]/.test(fiche.body), `fiche ${knownSlug} : <h1>/titre manquant`);
    ok(fiche.body.includes("application/ld+json"), `fiche ${knownSlug} : JSON-LD manquant`);
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

  // 6. URL inconnue → vraie 404.
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

  // 8. Aucun secret apparent dans le HTML servi.
  for (const pat of [/service_role/i, /\.invalid\b/, /email_normalized/, /v1\/integrations\/deploy/i]) {
    ok(!pat.test(fr.body) && !pat.test(en.body), `secret/donnée privée apparente : ${pat}`);
  }

  if (failures.length > 0) {
    console.error(`[verify:production] ÉCHEC (${failures.length}) sur ${target} :`);
    for (const f of failures) console.error("  -", f);
    process.exit(1);
  }
  console.log(`[verify:production] OK : ${target} sert le pré-rendu, redirige, 404 réelle, en-têtes présents.`);
}

main().catch((err) => {
  console.error("[verify:production] erreur :", err.message);
  process.exit(1);
});
