// Vérification du dist/ pré-rendu (Sprint 11/12, Parties I & J). Contrôle que
// le HTML PRODUIT contient réellement le contenu attendu ET qu'aucun secret ne
// fuit dans le bundle. À lancer après `npm run build` (étape CI).
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(fileURLToPath(new URL("..", import.meta.url)), "dist");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
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

async function main() {
  // 1. Contenu réellement pré-rendu (pas seulement après hydratation).
  const fr = await readFile(join(DIST, "fr", "index.html"), "utf8");
  check(
    fr.includes("Des jeux qui sortent des sentiers battus"),
    "dist/fr/index.html : H1 de marque FR manquant",
  );
  check(fr.includes('<link rel="canonical"'), "dist/fr : canonical manquant");
  check(fr.includes('hreflang="x-default"'), "dist/fr : hreflang manquant");
  check(
    fr.includes('type="application/ld+json"'),
    "dist/fr : JSON-LD manquant",
  );

  const en = await readFile(join(DIST, "en", "index.html"), "utf8");
  check(
    en.includes("Board games that break the mold"),
    "dist/en/index.html : H1 anglais manquant",
  );

  const notFound = await readFile(join(DIST, "404.html"), "utf8");
  check(notFound.includes("noindex"), "dist/404.html : noindex manquant");

  await readFile(join(DIST, "sitemap.xml"), "utf8").then((s) => {
    check(!s.includes("/admin"), "sitemap.xml : /admin ne doit pas apparaître");
  });
  await readFile(join(DIST, "robots.txt"), "utf8").then((r) => {
    check(r.includes("Disallow: /admin"), "robots.txt : /admin non interdit");
  });

  // 2. Aucun secret dans le bundle livré.
  const forbidden = [
    /service_role/i,
    /SUPABASE_SERVICE_ROLE/i,
    /v1\/integrations\/deploy/i, // URL de Deploy Hook Vercel
    /RATE_LIMIT_SALT/,
  ];
  for (const file of await readAllFiles(DIST)) {
    const content = await readFile(file, "utf8").catch(() => "");
    for (const pattern of forbidden) {
      if (pattern.test(content)) {
        failures.push(`Secret potentiel dans ${file} : ${pattern}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error("[verify-dist] ÉCHEC :");
    for (const f of failures) console.error("  -", f);
    process.exit(1);
  }
  console.log("[verify-dist] OK : contenu pré-rendu présent, aucun secret livré.");
}

main().catch((err) => {
  console.error("[verify-dist] erreur :", err);
  process.exit(1);
});
