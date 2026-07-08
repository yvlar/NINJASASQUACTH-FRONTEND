// Test verrou : hiérarchie des headings (D9). « Origines Mystérieuses »
// existe en h1 du hero ET en titre du jeu 1 (fixture) : la page doit garder
// un h1 unique dans toutes les vues (y compris la vue détail d'un jeu, qui
// rendait un second h1) et une hiérarchie sans saut de niveau :
// h1 (hero) → h2 (sous-titre du hero, sections, titre du détail)
// → h3 (cartes de jeux, blocs éco/caractéristiques).
// Les jeux viennent de Supabase (mocké, fixtures au format table).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    <LanguageProvider>
      <App />
    </LanguageProvider>,
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
  it("vue par défaut : un seul h1 (le hero), aucun saut de niveau", async () => {
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

  it("vue détail d'un jeu : toujours un seul h1, le titre du jeu est un h2", async () => {
    renderApp();
    // Ouvre la vue détail du jeu 1 (clic sur sa carte, homonyme du hero).
    fireEvent.click(
      await screen.findByRole("heading", {
        level: 3,
        name: "Origines Mystérieuses",
      }),
    );
    expect(screen.getByText("← Retour aux jeux")).toBeInTheDocument();
    expectSingleH1AndNoSkip();
    expect(
      screen.getByRole("heading", { level: 2, name: "Origines Mystérieuses" }),
    ).toBeInTheDocument();
  });
});
