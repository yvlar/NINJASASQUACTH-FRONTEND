// Test verrou (item 4.1, revu Sprint 9) : accessibilité des cartes de jeu.
// La carte n'est plus un div role="button" mais un VRAI lien (<a>/Link) vers
// la fiche partageable — nativement focalisable et activable au clavier. On
// vérifie que chaque carte est un lien pointant sur la bonne route localisée.
// Les jeux viennent de Supabase (mocké, fixtures au format table).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { JEUX_FIXTURES } from "./fixtures/games";
import { gamePath } from "../utils/routes";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;

const renderApp = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  supabase.__reset();
  supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
});

describe("Accessibilité des cartes de jeu (liens réels)", () => {
  it("chaque carte est un lien vers la fiche localisée du jeu (FR)", async () => {
    renderApp();
    for (const game of JEUX_FIXTURES) {
      const heading = await screen.findByRole("heading", {
        level: 3,
        name: game.title_fr,
      });
      // le lien enveloppe le titre : on remonte au plus proche <a>
      const link = heading.closest("a");
      expect(link, `carte « ${game.title_fr} » n'est pas un lien`).not.toBeNull();
      expect(link).toHaveAttribute("href", gamePath("fr", game.slug!));
    }
  });
});
