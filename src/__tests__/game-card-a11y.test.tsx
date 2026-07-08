// Test verrou (item 4.1) : accessibilité clavier des cartes de jeu.
// La carte GameCard n'est pas un <button> natif (elle contient un h3, interdit
// dans un élément interactif natif) : elle doit donc porter role="button",
// être focalisable (tabIndex 0) et s'activer à Entrée ET Espace, sinon la vue
// détail est inatteignable sans souris.
// Les jeux viennent de Supabase (mocké, fixtures au format table).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";
import type { GameRow } from "../types/database";

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

// La carte est identifiée comme bouton accessible dont le nom contient le
// titre du jeu (le nom accessible d'un role="button" est son contenu texte).
const findCard = async (game: GameRow) => {
  await screen.findByRole("heading", { level: 3, name: game.title_fr });
  return screen
    .getAllByRole("button")
    .find((el) => el.textContent?.includes(game.title_fr));
};

beforeEach(() => {
  supabase.__reset();
  supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
});

describe("Accessibilité clavier des cartes de jeu", () => {
  it("chaque carte est un bouton accessible et focalisable au clavier", async () => {
    renderApp();
    for (const game of JEUX_FIXTURES) {
      const card = await findCard(game);
      expect(card, `carte « ${game.title_fr} » sans role=button`).toBeTruthy();
      expect(card).toHaveAttribute("tabindex", "0");
    }
  });

  it("Entrée sur une carte ouvre la vue détail du jeu", async () => {
    renderApp();
    fireEvent.keyDown((await findCard(JEUX_FIXTURES[0]))!, { key: "Enter" });
    expect(
      screen.getByText(JEUX_FIXTURES[0].full_desc_fr),
    ).toBeInTheDocument();
  });

  it("Espace sur une carte ouvre la vue détail du jeu", async () => {
    renderApp();
    fireEvent.keyDown((await findCard(JEUX_FIXTURES[1]))!, { key: " " });
    expect(
      screen.getByText(JEUX_FIXTURES[1].full_desc_fr),
    ).toBeInTheDocument();
  });
});
