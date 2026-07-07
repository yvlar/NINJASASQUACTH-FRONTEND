// Test verrou : le contrat de navigation par ancres. Les boutons du Header
// appellent scrollToSection(id) — chaque id doit correspondre à une
// <section id="..."> réellement rendue par App, sinon le clic ne fait rien.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";

// jsdom n'implémente pas scrollIntoView : on l'espionne pour observer
// quelle section reçoit le défilement.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const renderApp = () =>
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );

describe("Contrat de navigation", () => {
  it("les quatre ancres du contrat sont rendues comme sections", () => {
    renderApp();
    for (const id of ["accueil", "jeux", "univers", "contact"]) {
      const section = document.getElementById(id);
      expect(section, `section #${id} absente`).not.toBeNull();
      expect(section.tagName).toBe("SECTION");
    }
  });

  it("chaque bouton de nav fait défiler vers sa section", () => {
    renderApp();
    const links = [
      ["Accueil", "accueil"],
      ["Nos Jeux", "jeux"],
      ["Notre Univers", "univers"],
      ["Contact", "contact"],
    ];
    for (const [label, id] of links) {
      Element.prototype.scrollIntoView.mockClear();
      // Le libellé existe en nav desktop et en menu mobile : le premier suffit.
      fireEvent.click(screen.getAllByRole("button", { name: label })[0]);
      const target = document.getElementById(id);
      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
