// Verrous de la couche SEO (Sprint 11, Parties C/D) : buildMeta (métadonnées
// pures par route) + renderHead (sérialisation <head> du pré-rendu) + jsonLd.
// Tout est pur — aucun réseau, aucun DOM.
import { describe, it, expect } from "vitest";
import { buildMeta } from "../seo/buildMeta";
import { renderHeadTags } from "../seo/renderHead";
import { gameJsonLd, organizationJsonLd } from "../seo/jsonLd";
import { JEUX_FIXTURES } from "./fixtures/games";

const SITE = "https://exemple.test";
const [origines, missionNinja] = JEUX_FIXTURES;

describe("buildMeta — accueil", () => {
  it("titre/description FR et EN distincts", () => {
    const fr = buildMeta({ kind: "home", lang: "fr" }, { siteUrl: SITE });
    const en = buildMeta({ kind: "home", lang: "en" }, { siteUrl: SITE });
    expect(fr.title).toContain("Québec");
    expect(en.title).toContain("Quebec");
    expect(fr.title).not.toBe(en.title);
    expect(fr.description).not.toBe(en.description);
  });

  it("canonical et alternates réciproques (fr/en/x-default)", () => {
    const fr = buildMeta({ kind: "home", lang: "fr" }, { siteUrl: SITE });
    expect(fr.canonical).toBe(`${SITE}/fr`);
    expect(fr.alternates).toEqual([
      { hreflang: "fr", href: `${SITE}/fr` },
      { hreflang: "en", href: `${SITE}/en` },
      { hreflang: "x-default", href: `${SITE}/fr` },
    ]);
  });

  it("locale OG et alternate croisées", () => {
    const fr = buildMeta({ kind: "home", lang: "fr" }, { siteUrl: SITE });
    expect(fr.ogLocale).toBe("fr_CA");
    expect(fr.ogLocaleAlternate).toBe("en_CA");
  });

  it("émet Organization + WebSite en JSON-LD", () => {
    const fr = buildMeta({ kind: "home", lang: "fr" }, { siteUrl: SITE });
    const types = fr.jsonLd.map((ld) => ld["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });
});

describe("buildMeta — fiche jeu", () => {
  it("titre unique par jeu et canonical localisé, slug partagé", () => {
    const fr = buildMeta(
      { kind: "game", lang: "fr", game: origines },
      { siteUrl: SITE },
    );
    const en = buildMeta(
      { kind: "game", lang: "en", game: origines },
      { siteUrl: SITE },
    );
    expect(fr.title.startsWith("Origines Mystérieuses")).toBe(true);
    expect(en.title.startsWith("Mysterious Origins")).toBe(true);
    expect(fr.canonical).toBe(`${SITE}/fr/jeux/origines-mysterieuses`);
    expect(en.canonical).toBe(`${SITE}/en/games/origines-mysterieuses`);
    // alternate FR pointe vers /fr/jeux, EN vers /en/games (même slug)
    expect(fr.alternates).toContainEqual({
      hreflang: "en",
      href: `${SITE}/en/games/origines-mysterieuses`,
    });
  });

  it("utilise la photo du jeu si elle existe, sinon l'image de marque", () => {
    const withImg = buildMeta(
      { kind: "game", lang: "fr", game: origines },
      { siteUrl: SITE },
    );
    expect(withImg.image.url).toBe(origines.image_url);
    // Mission Ninja n'a pas d'image → repli de marque (PNG réel 1200×630)
    const noImg = buildMeta(
      { kind: "game", lang: "fr", game: missionNinja },
      { siteUrl: SITE },
    );
    expect(noImg.image.url).toBe(`${SITE}/og/brand.png`);
    expect(noImg.image.type).toBe("image/png");
  });
});

describe("buildMeta — 404", () => {
  it("noindex et pas de canonical", () => {
    const meta = buildMeta({ kind: "notFound", lang: "fr" }, { siteUrl: SITE });
    expect(meta.robots).toBe("noindex, follow");
    expect(meta.canonical).toBeUndefined();
    expect(meta.alternates).toHaveLength(0);
  });
});

describe("gameJsonLd — n'inclut QUE les données réelles", () => {
  const canonical = `${SITE}/fr/jeux/origines-mysterieuses`;
  const ld = gameJsonLd(origines, "fr", { siteUrl: SITE, canonical });

  it("@type Product+Game, jamais de prix/offre/avis/note", () => {
    expect(ld["@type"]).toEqual(["Product", "Game"]);
    const serialized = JSON.stringify(ld).toLowerCase();
    for (const forbidden of [
      "offer",
      "price",
      "aggregaterating",
      "review",
      "availability",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("numberOfPlayers, inLanguage, suggestedMinAge, timeRequired dérivés des champs réels", () => {
    expect(ld.numberOfPlayers).toMatchObject({ minValue: 2, maxValue: 6 });
    expect(ld.inLanguage).toEqual(["fr", "en"]);
    expect(ld.audience).toMatchObject({ suggestedMinAge: 8 });
    expect(ld.timeRequired).toBe("PT45M");
  });

  it("un jeu sans données structurées ne fabrique pas de champs", () => {
    const bare = gameJsonLd(missionNinja, "fr", {
      siteUrl: SITE,
      canonical: `${SITE}/fr/jeux/mission-ninja`,
    });
    // pas de langues ni d'image → champs absents
    expect(bare.inLanguage).toBeUndefined();
    expect(bare.image).toBeUndefined();
  });
});

describe("renderHeadTags — HTML de <head> du pré-rendu", () => {
  it("contient title, description, canonical, hreflang, OG, twitter et JSON-LD", () => {
    const meta = buildMeta(
      { kind: "game", lang: "fr", game: origines },
      { siteUrl: SITE },
    );
    const html = renderHeadTags(meta);
    expect(html).toContain("<title>Origines Mystérieuses");
    expect(html).toContain('<meta name="description"');
    expect(html).toContain(
      '<link rel="canonical" href="https://exemple.test/fr/jeux/origines-mysterieuses"',
    );
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('type="application/ld+json"');
  });

  it("échappe le « < » dans le JSON-LD (pas d'évasion de <script>)", () => {
    const injected = organizationJsonLd(SITE);
    injected.name = "Bad</script><x>";
    const html = renderHeadTags({
      ...buildMeta({ kind: "home", lang: "fr" }, { siteUrl: SITE }),
      jsonLd: [injected],
    });
    expect(html).not.toContain("</script><x>");
    expect(html).toContain("\\u003c/script>");
  });
});
