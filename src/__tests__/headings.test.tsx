// Test verrou : hiérarchie des headings (D9). « Origines Mystérieuses »
// existe en h1 du hero ET en titre de carte de jeu (fixture) : l'accueil doit
// garder un h1 unique et une hiérarchie sans saut de niveau :
// h1 (hero) → h2 (sous-titre du hero, sections) → h3 (cartes, blocs).
// Depuis le Sprint 9, la vue détail est une route dédiée (fiche jeu) : plus
// de bascule inline dans la page d'accueil.
// Les jeux viennent de Supabase (mocké, fixtures au format table).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

// Cast unique : sous vi.mock, ce module est en réalité le mock complet
// (méthodes __* incluses), pas le client Supabase typé.
const supabase = supabaseClient as unknown as SupabaseMock;

const renderApp = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>,
  );

// Niveaux des headings dans l'ordre du document (H1 → 1, H2 → 2…).
const headingLevels = () =>
  screen.getAllByRole("heading").map((h) => Number(h.tagName.slice(1)));

const expectSingleH1AndNoSkip = () => {
  const levels = headingLevels();
  expect(levels.filter((level) => level === 1)).toHaveLength(1);
  expect(levels[0]).toBe(1); // le h1 ouvre la hiérarchie (hero)
  levels.forEach((level, i) => {
    if (i > 0) {
      // descendre d'au plus un niveau à la fois (2→3 ok, 1→3 interdit)
      expect(level).toBeLessThanOrEqual(levels[i - 1]! + 1);
    }
  });
};

beforeEach(() => {
  supabase.__reset();
  supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
});

describe("Hiérarchie des headings", () => {
  it("accueil : un seul h1 (le hero), aucun saut de niveau", async () => {
    renderApp();
    // attendre le rendu asynchrone des cartes (h3) avant d'auditer
    await screen.findByRole("heading", {
      level: 3,
      name: "Origines Mystérieuses",
    });
    expectSingleH1AndNoSkip();
    expect(
      screen.getByRole("heading", { level: 1, name: "Origines Mystérieuses" }),
    ).toBeInTheDocument();
  });

  it("le titre de carte homonyme du hero est un h3, pas un second h1", async () => {
    renderApp();
    await screen.findByRole("heading", {
      level: 3,
      name: "Origines Mystérieuses",
    });
    // un seul h1 malgré l'homonymie hero/carte
    expect(
      screen.getAllByRole("heading", { level: 1, name: "Origines Mystérieuses" }),
    ).toHaveLength(1);
  });
});
