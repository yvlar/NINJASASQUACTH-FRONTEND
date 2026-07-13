// Séparation contenu réel / marketing (Prompt 5, items 12 & 13) :
//  - « Comment jouer » ne montre que des ÉTAPES réelles (how_to_play_*), sinon
//    la section est masquée — les mécaniques vivent dans GameMechanics ;
//  - les « Règles » utilisent rules_summary_*, jamais la description marketing.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import HowToPlay from "../components/game/HowToPlay";
import GameMechanics from "../components/game/GameMechanics";
import FullRulesAccordion from "../components/game/FullRulesAccordion";
import fr from "../data/translations/fr.json";
import { JEUX_FIXTURES } from "./fixtures/games";
import type { GameRow } from "../types/database";

const BASE = JEUX_FIXTURES[0];
const render_ = (node: React.ReactNode) =>
  render(<LanguageProvider>{node}</LanguageProvider>);

describe("HowToPlay — étapes réelles seulement", () => {
  it("affiche les étapes réelles en liste ordonnée", () => {
    const game: GameRow = {
      ...BASE,
      how_to_play_fr: "Piochez trois cartes\nJouez une action\nPassez au voisin",
      mechanics: ["deck-building"],
    };
    render_(<HowToPlay game={game} />);
    expect(
      screen.getByRole("heading", { name: fr.games.detail.howToPlay }),
    ).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Piochez trois cartes");
    // Ne contient PAS les mécaniques (elles ont leur propre section).
    expect(screen.queryByText("deck-building")).toBeNull();
  });

  it("est masqué sans étapes réelles (même si des mécaniques existent)", () => {
    const game: GameRow = {
      ...BASE,
      how_to_play_fr: null,
      how_to_play_en: null,
      mechanics: ["deck-building"],
    };
    const { container } = render_(<HowToPlay game={game} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("GameMechanics — section distincte", () => {
  it("affiche les mécaniques sous le titre « Mécaniques »", () => {
    const game: GameRow = { ...BASE, mechanics: ["exploration", "déduction"] };
    render_(<GameMechanics game={game} />);
    expect(
      screen.getByRole("heading", { name: fr.games.detail.mechanics }),
    ).toBeInTheDocument();
    expect(screen.getByText("exploration")).toBeInTheDocument();
  });
});

describe("FullRulesAccordion — règles réelles, pas le marketing", () => {
  it("utilise rules_summary et non full_desc", () => {
    const game: GameRow = {
      ...BASE,
      full_desc_fr: "Texte MARKETING long et vendeur.",
      rules_summary_fr: "Objectif : marquer le plus de points.",
    };
    render_(<FullRulesAccordion game={game} />);
    expect(
      screen.getByText("Objectif : marquer le plus de points."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Texte MARKETING long et vendeur.")).toBeNull();
  });

  it("est masqué sans règles réelles (même avec une description marketing)", () => {
    const game: GameRow = {
      ...BASE,
      full_desc_fr: "Marketing seulement.",
      rules_summary_fr: null,
      rules_summary_en: null,
    };
    const { container } = render_(<FullRulesAccordion game={game} />);
    expect(container).toBeEmptyDOMElement();
  });
});
