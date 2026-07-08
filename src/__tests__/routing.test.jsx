// Verrou du routage : « / » = site vitrine inchangé, « /admin » = espace
// d'administration, chemin inconnu = retour au site vitrine.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageProvider from "../i18n/LanguageProvider";
import AppRoutes from "../AppRoutes";
import fr from "../data/translations/fr.json";

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe("routage", () => {
  it("rend le site vitrine sur /", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { level: 1, name: "Origines Mystérieuses" }),
    ).toBeInTheDocument();
  });

  it("rend l'espace admin sur /admin (chargé à la demande)", async () => {
    renderAt("/admin");
    expect(
      await screen.findByRole("heading", { name: fr.admin.title }),
    ).toBeInTheDocument();
  });

  it("ramène les chemins inconnus vers le site vitrine", () => {
    renderAt("/inconnu");
    expect(
      screen.getByRole("heading", { level: 1, name: "Origines Mystérieuses" }),
    ).toBeInTheDocument();
  });
});
