// Verrous d'accessibilité du menu mobile du Header : aria-label / aria-expanded
// / aria-controls, bascule ouvert-fermé, fermeture par Échap avec retour du
// focus, et logo cliquable vers l'accueil localisé.
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageProvider from "../i18n/LanguageProvider";
import Header from "../components/layout/Header";

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/fr"]}>
      <LanguageProvider>
        <Header onNavigate={vi.fn()} />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

// Le bouton bascule est identifié par aria-controls (deux « Accueil » existent :
// le lien logo et l'item de nav).
const getToggle = () =>
  document.querySelector<HTMLButtonElement>(
    'button[aria-controls="mobile-menu"]',
  )!;

describe("Header — menu mobile accessible", () => {
  it("le bouton porte aria-controls, aria-expanded et une étiquette", () => {
    renderHeader();
    const toggle = getToggle();
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-label")?.length).toBeGreaterThan(0);
    expect(document.getElementById("mobile-menu")).toBeNull();
  });

  it("bascule aria-expanded et affiche/masque le menu", () => {
    renderHeader();
    const toggle = getToggle();
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById("mobile-menu")).toBeTruthy();
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("mobile-menu")).toBeNull();
  });

  it("Échap ferme le menu et rend le focus au bouton", () => {
    renderHeader();
    const toggle = getToggle();
    fireEvent.click(toggle);
    expect(document.getElementById("mobile-menu")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.getElementById("mobile-menu")).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it("le logo est un lien vers l'accueil localisé", () => {
    renderHeader();
    const homeLink = screen.getByRole("link", { name: /accueil/i });
    expect(homeLink.getAttribute("href")).toBe("/fr");
  });
});
