// Verrou de la localisation d'un jeu venu de Supabase : les champs plats
// bilingues (title_fr/title_en, …) sont résolus selon la langue courante.
import { describe, expect, it } from "vitest";
import { localizeGame } from "../utils/localizeGame";
import { JEUX_FIXTURES } from "./fixtures/games";

const jeu = JEUX_FIXTURES[0];

describe("localizeGame", () => {
  it("résout les champs français", () => {
    expect(localizeGame(jeu, "fr")).toEqual({
      title: "Origines Mystérieuses",
      shortDesc: jeu.short_desc_fr,
      fullDesc: jeu.full_desc_fr,
    });
  });

  it("résout les champs anglais", () => {
    expect(localizeGame(jeu, "en")).toEqual({
      title: "Mysterious Origins",
      shortDesc: jeu.short_desc_en,
      fullDesc: jeu.full_desc_en,
    });
  });

  it("retombe sur le français pour une langue inconnue", () => {
    expect(localizeGame(jeu, "xx").title).toBe("Origines Mystérieuses");
  });

  it("retourne des chaînes vides pour des champs absents", () => {
    expect(localizeGame({}, "fr")).toEqual({
      title: "",
      shortDesc: "",
      fullDesc: "",
    });
  });
});
