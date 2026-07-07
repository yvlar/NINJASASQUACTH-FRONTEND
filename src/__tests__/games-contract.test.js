// Test verrou : le contrat byte-for-byte entre src/data/games.js et les
// traductions. Les IDs de catégories (accents compris) servent de clés de
// filtrage ET de clés de traduction — toute divergence casse silencieusement
// le filtre ou affiche une clé brute dans l'UI.
import { describe, it, expect } from "vitest";
import { games, categories } from "../data/games";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

describe("Contrat catégories/jeux", () => {
  it("les quatre IDs de catégories attendus sont présents, accents compris", () => {
    expect(categories.map((c) => c.id)).toEqual([
      "tous",
      "famille",
      "stratégie",
      "party",
    ]);
  });

  it("chaque jeu référence une catégorie déclarée (hors « tous »)", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const game of games) {
      expect(ids.has(game.category), `catégorie inconnue : ${game.category}`).toBe(
        true,
      );
      expect(game.category).not.toBe("tous");
    }
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

  it("chaque jeu a title/shortDesc/fullDesc dans les deux langues", () => {
    for (const game of games) {
      for (const [lang, messages] of Object.entries({ fr, en })) {
        const item = messages.games.items[String(game.id)];
        expect(item, `games.items.${game.id} manquant (${lang})`).toBeTruthy();
        for (const field of ["title", "shortDesc", "fullDesc"]) {
          expect(
            item[field],
            `games.items.${game.id}.${field} manquant (${lang})`,
          ).toBeTruthy();
        }
      }
    }
  });

  it("chaque jeu porte les données non traduisibles attendues", () => {
    for (const game of games) {
      expect(game.id).toEqual(expect.any(Number));
      expect(game.image).toMatch(/^https?:\/\//);
      expect(game.players).toBeTruthy();
      expect(game.duration).toBeTruthy();
      expect(game.age).toBeTruthy();
      expect(typeof game.eco).toBe("boolean");
    }
  });
});
