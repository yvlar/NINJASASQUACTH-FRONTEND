// Verrou du routage localisé (Sprint 9) :
//   /            → redirection vers /fr (accueil français)
//   /fr, /en     → accueil localisé (le hero rend son h1)
//   /admin       → espace d'administration chargé à la demande
//   chemin inconnu → VRAIE page 404 (plus de redirection muette vers l'accueil)
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageProvider from "../i18n/LanguageProvider";
import AppRoutes from "../AppRoutes";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";

// /admin monte AuthProvider ; GamesSection lit Supabase → client mocké
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

describe("routage localisé", () => {
  it("redirige / vers l'accueil français /fr", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { level: 1, name: fr.hero.title }),
    ).toBeInTheDocument();
  });

  it("rend l'accueil français sur /fr", () => {
    renderAt("/fr");
    expect(
      screen.getByRole("heading", { level: 1, name: fr.hero.title }),
    ).toBeInTheDocument();
  });

  it("rend l'accueil anglais sur /en", () => {
    renderAt("/en");
    expect(
      screen.getByRole("heading", { level: 1, name: en.hero.title }),
    ).toBeInTheDocument();
  });

  it("rend l'espace admin sur /admin (chargé à la demande)", async () => {
    renderAt("/admin");
    expect(screen.getByRole("status")).toHaveTextContent(fr.admin.loading);
    expect(
      await screen.findByRole("heading", { name: fr.admin.title }),
    ).toBeInTheDocument();
  });

  it("rend une vraie page 404 sur un chemin inconnu", () => {
    renderAt("/chemin-inconnu");
    expect(
      screen.getByRole("heading", { name: fr.notFound.title }),
    ).toBeInTheDocument();
    // ce n'est PAS l'accueil (plus de redirection muette)
    expect(
      screen.queryByRole("heading", { level: 1, name: fr.hero.title }),
    ).not.toBeInTheDocument();
  });
});
