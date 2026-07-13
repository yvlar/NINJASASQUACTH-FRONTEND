// Verrous de la validation client du formulaire de jeu (module pur) :
// champs requis, format du slug, entiers positifs, plages joueurs/durée
// (max >= min), et URL Kickstarter (format + exigence si campagne live).
import { describe, expect, it } from "vitest";
import { validateGameForm } from "../components/admin/GameForm/gameFormValidation";
import {
  INITIAL_VALUES,
  type GameFormValues,
} from "../components/admin/GameForm/gameFormTypes";

// Valeurs valides minimales (tous les champs requis remplis).
const VALIDE: GameFormValues = {
  ...INITIAL_VALUES,
  slug: "sentiers-sauvages",
  title_fr: "Sentiers",
  title_en: "Trails",
  short_desc_fr: "court fr",
  short_desc_en: "short en",
  full_desc_fr: "long fr",
  full_desc_en: "long en",
  players_min: "2",
  players_max: "4",
  duration_min: "30",
  duration_max: "60",
  minimum_age: "10",
};

describe("validateGameForm", () => {
  it("ne renvoie aucune erreur pour des valeurs valides", () => {
    expect(validateGameForm(VALIDE, null)).toEqual({});
  });

  it("exige les champs de parité FR/EN (hors slug)", () => {
    const errors = validateGameForm(INITIAL_VALUES, null);
    for (const champ of [
      "title_fr",
      "title_en",
      "short_desc_fr",
      "short_desc_en",
      "full_desc_fr",
      "full_desc_en",
      "players_min",
      "duration_min",
      "minimum_age",
    ] as const) {
      expect(errors[champ]).toBe("admin.form.errors.required");
    }
  });

  it("rejette un slug mal formé (majuscules, espaces)", () => {
    expect(validateGameForm({ ...VALIDE, slug: "Slug Invalide" }, null).slug).toBe(
      "admin.form.errors.slug",
    );
    expect(validateGameForm({ ...VALIDE, slug: "ok-123" }, null).slug).toBeUndefined();
  });

  it("accepte un brouillon sans slug", () => {
    // published=false + slug vide : aucun blocage sur le slug.
    const errors = validateGameForm(
      { ...VALIDE, slug: "", published: false },
      null,
    );
    expect(errors.slug).toBeUndefined();
  });

  it("refuse la publication sans slug", () => {
    const errors = validateGameForm(
      { ...VALIDE, slug: "", published: true },
      null,
    );
    expect(errors.slug).toBe("admin.form.errors.slugRequiredWhenPublished");
  });

  it("accepte un jeu publié avec un slug valide", () => {
    expect(
      validateGameForm({ ...VALIDE, slug: "ok-123", published: true }, null).slug,
    ).toBeUndefined();
  });

  it("rejette un nombre de joueurs non entier ou négatif", () => {
    expect(
      validateGameForm({ ...VALIDE, players_min: "-1" }, null).players_min,
    ).toBe("admin.form.errors.positiveInt");
    expect(
      validateGameForm({ ...VALIDE, players_min: "2.5" }, null).players_min,
    ).toBe("admin.form.errors.positiveInt");
  });

  it("rejette une plage joueurs incohérente (max < min)", () => {
    const errors = validateGameForm(
      { ...VALIDE, players_min: "5", players_max: "2" },
      null,
    );
    expect(errors.players_max).toBe("admin.form.errors.playersRange");
  });

  it("rejette une plage durée incohérente (max < min)", () => {
    const errors = validateGameForm(
      { ...VALIDE, duration_min: "60", duration_max: "30" },
      null,
    );
    expect(errors.duration_max).toBe("admin.form.errors.durationRange");
  });

  it("rejette une URL Kickstarter mal formée", () => {
    expect(
      validateGameForm({ ...VALIDE, kickstarter_url: "pas-une-url" }, null)
        .kickstarter_url,
    ).toBe("admin.form.errors.url");
  });

  it("exige une URL Kickstarter quand la campagne est live", () => {
    const errors = validateGameForm(
      { ...VALIDE, campaign_status: "live", kickstarter_url: "" },
      null,
    );
    expect(errors.kickstarter_url).toBe(
      "admin.form.errors.kickstarterRequired",
    );
  });

  it("accepte une URL Kickstarter valide", () => {
    expect(
      validateGameForm(
        {
          ...VALIDE,
          campaign_status: "live",
          kickstarter_url: "https://www.kickstarter.com/projects/x/y",
        },
        null,
      ).kickstarter_url,
    ).toBeUndefined();
  });
});
