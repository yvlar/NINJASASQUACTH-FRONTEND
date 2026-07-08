// Test verrou (item 4.1) : accessibilité clavier des cartes de jeu.
// La carte GameCard n'est pas un <button> natif (elle contient un h3, interdit
// dans un élément interactif natif) : elle doit donc porter role="button",
// être focalisable (tabIndex 0) et s'activer à Entrée ET Espace, sinon la vue
// détail est inatteignable sans souris.
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { games } from "../data/games";
import fr from "../data/translations/fr.json";

const renderApp = () =>
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );

const titleOf = (game) => fr.games.items[game.id].title;
const fullDescOf = (game) => fr.games.items[game.id].fullDesc;

// La carte est identifiée comme bouton accessible dont le nom contient le
// titre du jeu (le nom accessible d'un role="button" est son contenu texte).
const findCard = (game) =>
  screen
    .getAllByRole("button")
    .find((el) => el.textContent.includes(titleOf(game)));

describe("Accessibilité clavier des cartes de jeu", () => {
  it("chaque carte est un bouton accessible et focalisable au clavier", () => {
    renderApp();
    for (const game of games) {
      const card = findCard(game);
      expect(card, `carte « ${titleOf(game)} » sans role=button`).toBeTruthy();
      expect(card).toHaveAttribute("tabindex", "0");
    }
  });

  it("Entrée sur une carte ouvre la vue détail du jeu", () => {
    renderApp();
    fireEvent.keyDown(findCard(games[0]), { key: "Enter" });
    expect(screen.getByText(fullDescOf(games[0]))).toBeInTheDocument();
  });

  it("Espace sur une carte ouvre la vue détail du jeu", () => {
    renderApp();
    fireEvent.keyDown(findCard(games[1]), { key: " " });
    expect(screen.getByText(fullDescOf(games[1]))).toBeInTheDocument();
  });
});
