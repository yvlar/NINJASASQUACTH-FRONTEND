// Verrous du pré-rendu (Sprint 11, Parties A & E). Le rendu serveur est
// exercé directement (renderToString via entry-server) — aucun réseau, aucune
// écriture disque : on prouve que le HTML PRODUIT contient le vrai contenu et
// les bonnes métadonnées, pas seulement après hydratation.
import { describe, it, expect } from "vitest";
import { render } from "../entry-server";
import { planRoutes, NOT_FOUND_URL } from "../prerender/plan";
import { injectPage } from "../prerender/inject";
import { buildSitemap, buildRobots } from "../prerender/sitemap";
import { buildMeta } from "../seo/buildMeta";
import { renderHeadTags } from "../seo/renderHead";
import { JEUX_FIXTURES } from "./fixtures/games";

const SITE = "https://exemple.test";
const [origines] = JEUX_FIXTURES;
const seed = { games: [origines], media: {} };
const empty = { games: [], media: {} };

describe("pré-rendu — corps HTML réellement rempli", () => {
  it("/fr contient le H1 de marque français", () => {
    const html = render("/fr", empty);
    expect(html).toContain("Des jeux qui sortent des sentiers battus");
  });

  it("/en contient le H1 anglais (langue seedée sur l'URL)", () => {
    const html = render("/en", empty);
    expect(html).toContain("Board games that break the mold");
    expect(html).not.toContain("Des jeux qui sortent des sentiers battus");
  });

  it("la fiche jeu contient son contenu réel (titre du jeu)", () => {
    const html = render("/fr/jeux/origines-mysterieuses", seed);
    expect(html).toContain("Origines Mystérieuses");
  });

  it("une URL inconnue rend une vraie 404 (jamais l'accueil)", () => {
    const html = render(NOT_FOUND_URL, empty);
    expect(html).toContain("Page introuvable");
    expect(html).not.toContain("Des jeux qui sortent des sentiers battus");
  });
});

describe("pré-rendu — plan des routes", () => {
  const routes = planRoutes([origines]);
  const files = routes.map((r) => r.outFile);

  it("génère l'accueil FR/EN, une fiche par jeu et la 404", () => {
    expect(files).toContain("fr/index.html");
    expect(files).toContain("en/index.html");
    expect(files).toContain("fr/jeux/origines-mysterieuses/index.html");
    expect(files).toContain("en/games/origines-mysterieuses/index.html");
    expect(files).toContain("404.html");
  });

  it("ne pré-rend JAMAIS /admin", () => {
    expect(files.some((f) => f.includes("admin"))).toBe(false);
  });
});

describe("pré-rendu — injection dans le gabarit", () => {
  const template = `<!doctype html>
<html lang="fr">
  <head>
    <!--app-head-start--><title>repli</title><!--app-head-end-->
  </head>
  <body><div id="root"></div></body>
</html>`;

  it("remplace le <head> de repli, fixe la langue et remplit #root", () => {
    const html = injectPage(template, {
      headHtml: "<title>Vraie page</title>",
      bodyHtml: "<main>contenu</main>",
      lang: "en",
    });
    expect(html).toContain("<title>Vraie page</title>");
    expect(html).not.toContain("repli");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<div id="root"><main>contenu</main></div>');
  });
});

describe("pré-rendu — <head> produit (canonical, hreflang, JSON-LD valide)", () => {
  const meta = buildMeta(
    { kind: "game", lang: "fr", game: origines },
    { siteUrl: SITE },
  );
  const head = renderHeadTags(meta);

  it("canonical et hreflang réciproque sont dans le HTML produit", () => {
    expect(head).toContain(
      '<link rel="canonical" href="https://exemple.test/fr/jeux/origines-mysterieuses"',
    );
    expect(head).toContain(
      'hreflang="en" href="https://exemple.test/en/games/origines-mysterieuses"',
    );
  });

  it("le JSON-LD est syntaxiquement valide (JSON.parse) et de type Product+Game", () => {
    const matches = [
      ...head.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];
    expect(matches.length).toBeGreaterThan(0);
    const parsed = matches.map((m) => JSON.parse(m[1] ?? ""));
    const types = parsed.map((p) => JSON.stringify(p["@type"]));
    expect(types).toContain(JSON.stringify(["Product", "Game"]));
  });
});

describe("sitemap & robots (Partie E)", () => {
  const draft = {
    ...origines,
    id: "99999999-9999-4999-8999-999999999999",
    slug: "brouillon-secret",
    published: false,
  };
  const xml = buildSitemap([origines, draft], SITE);

  it("contient accueil FR/EN et chaque jeu publié FR/EN avec alternates", () => {
    expect(xml).toContain(`<loc>${SITE}/fr</loc>`);
    expect(xml).toContain(`<loc>${SITE}/en</loc>`);
    expect(xml).toContain(`<loc>${SITE}/fr/jeux/origines-mysterieuses</loc>`);
    expect(xml).toContain(`<loc>${SITE}/en/games/origines-mysterieuses</loc>`);
    expect(xml).toContain('hreflang="x-default"');
  });

  it("exclut les brouillons et /admin", () => {
    expect(xml).not.toContain("brouillon-secret");
    expect(xml).not.toContain("/admin");
  });

  it("robots.txt interdit /admin et pointe le sitemap", () => {
    const robots = buildRobots(SITE);
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});
