// Repli visuel de marque (Prompt 5, item 11) : un jeu sans image ne laisse
// plus une colonne vide — GameArtwork affiche un panneau thématisé (monogramme
// + signature), accessible, sans fausse boîte ni illustration inventée.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GameArtwork from "../components/game/GameArtwork";

describe("GameArtwork", () => {
  it("affiche la vraie photo quand image_url existe", () => {
    render(
      <GameArtwork
        imageUrl="https://exemple.test/photo.webp"
        title="Heroes Rising"
        themeKey="heroes-rising"
      />,
    );
    const img = screen.getByRole("img", { name: "Heroes Rising" });
    expect(img).toHaveAttribute("src", "https://exemple.test/photo.webp");
  });

  it("photo décorative : alt vide (titre annoncé ailleurs)", () => {
    render(
      <GameArtwork
        imageUrl="https://exemple.test/photo.webp"
        title="Heroes Rising"
        themeKey="heroes-rising"
        decorative
      />,
    );
    // alt="" → image présentational, absente de l'arbre d'accessibilité par nom.
    expect(screen.queryByRole("img", { name: "Heroes Rising" })).toBeNull();
    const img = document.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("sans image : repli de marque avec monogramme et nom accessible", () => {
    render(
      <GameArtwork imageUrl={null} title="Burgle Jack" themeKey="burgle-jack" />,
    );
    const panel = screen.getByRole("img", { name: "Burgle Jack" });
    // Monogramme des deux premiers mots.
    expect(panel).toHaveTextContent("BJ");
    // Aucune vraie balise <img> (pas de faux visuel de boîte).
    expect(document.querySelector("img")).toBeNull();
  });

  it("sans image et décoratif : panneau masqué de l'accessibilité", () => {
    render(<GameArtwork imageUrl={null} title="Solo" themeKey={null} decorative />);
    // aria-hidden → pas de rôle img exposé.
    expect(screen.queryByRole("img")).toBeNull();
    // Monogramme d'un seul mot : deux premières lettres.
    expect(screen.getByText("SO")).toBeInTheDocument();
  });
});
