// Verrous des chemins localisés : le segment de fiche diffère par langue
// (jeux/games), le slug est conservé lors d'une bascule de langue.
import { describe, expect, it } from "vitest";
import {
  gamePath,
  gamesSegment,
  homePath,
  otherLangPath,
} from "../utils/routes";

describe("chemins localisés", () => {
  it("le segment de fiche diffère par langue", () => {
    expect(gamesSegment("fr")).toBe("jeux");
    expect(gamesSegment("en")).toBe("games");
  });

  it("gamePath construit la route localisée avec le slug", () => {
    expect(gamePath("fr", "heroes-rising")).toBe("/fr/jeux/heroes-rising");
    expect(gamePath("en", "heroes-rising")).toBe("/en/games/heroes-rising");
  });

  it("homePath renvoie l'accueil localisé", () => {
    expect(homePath("fr")).toBe("/fr");
    expect(homePath("en")).toBe("/en");
  });

  it("otherLangPath bascule la fiche en conservant le slug", () => {
    expect(otherLangPath("/fr/jeux/heroes-rising", "fr")).toBe(
      "/en/games/heroes-rising",
    );
    expect(otherLangPath("/en/games/heroes-rising", "en")).toBe(
      "/fr/jeux/heroes-rising",
    );
  });

  it("otherLangPath bascule l'accueil", () => {
    expect(otherLangPath("/fr", "fr")).toBe("/en");
    expect(otherLangPath("/en", "en")).toBe("/fr");
  });
});
