// Verrous statiques d'identité visuelle + SEO (Sprint 11.1) :
//  - aucun ancien token Tailwind (brown / dark-green / eco-green) ne subsiste ;
//  - aucun faux gras Alfa Slab One (font-brand + font-bold/extrabold/black) ;
//  - le JSON-LD étiquette la complexité « Complexité », pas « Mécaniques ».
import { describe, it, expect } from "vitest";
import { gameJsonLd } from "../seo/jsonLd";
import { JEUX_FIXTURES } from "./fixtures/games";

// Contenu brut de tout le code source (hors tests) via Vite — pas de node:fs.
const RAW = import.meta.glob("../**/*.{ts,tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FILES = Object.entries(RAW).filter(
  ([path]) => !path.includes("/__tests__/"),
);

describe("identité visuelle — anciens tokens interdits", () => {
  // Utilitaires de couleur Tailwind sur les tokens retirés au rebranding.
  const OLD = /\b(?:bg|text|border|ring|from|to|via|fill|stroke|decoration|outline|accent|caret|divide|placeholder)-(?:brown|dark-green|eco-green)(?:\/\d+)?\b/;

  it("aucun bg-brown / text-dark-green / *-eco-green dans le code", () => {
    const offenders = FILES.filter(([, content]) => OLD.test(content)).map(
      ([path]) => path,
    );
    expect(offenders).toEqual([]);
  });
});

describe("typographie — pas de faux gras Alfa Slab One", () => {
  it("aucune classe font-brand combinée à un poids gras", () => {
    const WEIGHT = /font-(?:bold|extrabold|black|semibold)/;
    const offenders: string[] = [];
    for (const [path, content] of FILES) {
      if (!path.endsWith(".tsx")) continue;
      for (const line of content.split("\n")) {
        if (line.includes("font-brand") && WEIGHT.test(line)) {
          offenders.push(`${path} :: ${line.trim().slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("JSON-LD — libellé de complexité correct", () => {
  it("étiquette la complexité « Complexité » (jamais « Mécaniques »)", () => {
    const game = { ...JEUX_FIXTURES[0], complexity: "2.5 / 5", mechanics: ["deck-building"] };
    const ld = gameJsonLd(game, "fr", {
      siteUrl: "https://exemple.test",
      canonical: "https://exemple.test/fr/jeux/x",
    });
    const props = (ld.additionalProperty ?? []) as Array<{ name: string; value: unknown }>;
    const complexityProp = props.find((p) => p.value === "2.5 / 5");
    expect(complexityProp?.name).toBe("Complexité");
    expect(props.some((p) => p.name === "Mécaniques")).toBe(false);
  });
});
