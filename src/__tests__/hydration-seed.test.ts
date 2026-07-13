// Verrous de l'amorce d'hydratation (Sprint 11.1) : sérialisation SÛRE dans un
// <script>, relecture côté client, et langue déduite de l'URL (le premier rendu
// client doit correspondre au HTML serveur — jamais de flash FR→EN).
import { describe, it, expect } from "vitest";
import {
  serializePrerenderData,
  readPrerenderSeed,
  PRERENDER_SCRIPT_ID,
} from "../ssr/serializeSeed";
import { langFromUrl } from "../i18n/langFromUrl";
import type { PrerenderData } from "../ssr/prerenderContext";

describe("serializePrerenderData — sérialisation sûre", () => {
  it("neutralise </script> et les caractères dangereux", () => {
    const data = {
      games: [{ title_fr: "</script><script>alert(1)</script>" }],
      media: {},
    } as unknown as PrerenderData;
    const out = serializePrerenderData(data);
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    // Reste du JSON valide et fidèle après désérialisation.
    expect(JSON.parse(out)).toEqual(data);
  });

  it("échappe les séparateurs de ligne U+2028 / U+2029", () => {
    const data = {
      games: [{ title_fr: "a\u2028b\u2029c" }],
      media: {},
    } as unknown as PrerenderData;
    const out = serializePrerenderData(data);
    expect(out).not.toContain("\u2028");
    expect(out).not.toContain("\u2029");
    expect(JSON.parse(out)).toEqual(data);
  });
});

describe("readPrerenderSeed — relecture côté client", () => {
  it("relit l'amorce depuis le <script> injecté", () => {
    const seed: PrerenderData = { games: [], media: {} };
    const el = document.createElement("script");
    el.id = PRERENDER_SCRIPT_ID;
    el.type = "application/json";
    el.textContent = serializePrerenderData(seed);
    document.body.appendChild(el);
    expect(readPrerenderSeed()).toEqual(seed);
    el.remove();
  });

  it("retourne null si l'amorce est absente ou illisible", () => {
    expect(readPrerenderSeed()).toBeNull();
    const el = document.createElement("script");
    el.id = PRERENDER_SCRIPT_ID;
    el.type = "application/json"; // évite l'exécution JS par jsdom
    el.textContent = "{ pas du json";
    document.body.appendChild(el);
    expect(readPrerenderSeed()).toBeNull();
    el.remove();
  });
});

describe("langFromUrl — langue du premier rendu", () => {
  it("déduit la langue de l'URL (défaut FR)", () => {
    expect(langFromUrl("/fr")).toBe("fr");
    expect(langFromUrl("/")).toBe("fr");
    expect(langFromUrl("/fr/jeux/origines")).toBe("fr");
    expect(langFromUrl("/en")).toBe("en");
    expect(langFromUrl("/en/games/origins")).toBe("en");
    // « /engrenage » n'est pas /en : pas de faux positif.
    expect(langFromUrl("/engrenage")).toBe("fr");
  });
});
