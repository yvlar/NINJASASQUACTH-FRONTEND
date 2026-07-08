// Verrou du routage : « / » = site vitrine inchangé, « /admin » = espace
// d'administration, chemin inconnu = retour au site vitrine.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageProvider from "../i18n/LanguageProvider";
import AppRoutes from "../AppRoutes";
import fr from "../data/translations/fr.json";

// /admin monte AuthProvider → le client Supabase doit être mocké
// (aucun test ne touche le réseau, aucune env requise).
vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

function renderAt(path: string) {
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
