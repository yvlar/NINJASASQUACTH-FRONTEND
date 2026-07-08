// Test verrou : le contrat des catégories, désormais partagé entre le filtre
// du site public, le formulaire admin, les libellés i18n ET la contrainte
// CHECK de la table Supabase `games`. Les IDs (accents compris) sont
// significatifs byte-for-byte — toute divergence casse silencieusement le
// filtre, affiche une clé brute dans l'UI ou fait rejeter l'insertion par la
// base. Les jeux eux-mêmes vivent dans Supabase (fixtures au format table).
import { describe, it, expect } from "vitest";
import { categories } from "../data/games";
import { localizeGame } from "../utils/localizeGame";
import { JEUX_FIXTURES } from "./fixtures/games";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

// Miroir de la contrainte CHECK de la migration
// supabase/migrations/20260708032500_init_games_auth.sql
const CATEGORIES_EN_BASE = ["famille", "stratégie", "party"];

describe("Contrat des catégories", () => {
  it("les quatre IDs attendus sont présents, accents compris", () => {
    expect(categories.map((c) => c.id)).toEqual([
      "tous",
      "famille",
      "stratégie",
      "party",
    ]);
  });

  it("les catégories offertes à l'admin = les déclarées moins « tous » (contrainte CHECK)", () => {
    expect(categories.filter((c) => c.id !== "tous").map((c) => c.id)).toEqual(
      CATEGORIES_EN_BASE,
    );
  });

  it("chaque catégorie a son libellé dans les deux langues", () => {
    for (const { id } of categories) {
      for (const [lang, messages] of Object.entries({ fr, en })) {
        expect(
          messages.games.categories[id],
          `libellé manquant pour games.categories.${id} (${lang})`,
        ).toBeTruthy();
      }
    }
  });
});

describe("Contrat des jeux au format Supabase (fixtures)", () => {
  it("chaque fixture référence une catégorie de la contrainte CHECK", () => {
    for (const game of JEUX_FIXTURES) {
      expect(
        CATEGORIES_EN_BASE.includes(game.category),
        `catégorie inconnue : ${game.category}`,
      ).toBe(true);
    }
  });

  it("chaque fixture porte le contenu bilingue complet (parité *_fr/*_en)", () => {
    for (const game of JEUX_FIXTURES) {
      for (const lang of ["fr", "en"]) {
        const { title, shortDesc, fullDesc } = localizeGame(game, lang);
        expect(title, `title (${lang}) vide pour ${game.id}`).toBeTruthy();
        expect(
          shortDesc,
          `shortDesc (${lang}) vide pour ${game.id}`,
        ).toBeTruthy();
        expect(
          fullDesc,
          `fullDesc (${lang}) vide pour ${game.id}`,
        ).toBeTruthy();
      }
    }
  });

  it("chaque fixture porte les données non traduisibles attendues", () => {
    for (const game of JEUX_FIXTURES) {
      expect(game.id).toEqual(expect.any(String));
      if (game.image_url !== null) {
        expect(game.image_url).toMatch(/^https?:\/\//);
      }
      expect(game.players).toBeTruthy();
      expect(game.duration).toBeTruthy();
      expect(game.age).toBeTruthy();
      expect(typeof game.eco).toBe("boolean");
      expect(typeof game.published).toBe("boolean");
    }
  });
});
