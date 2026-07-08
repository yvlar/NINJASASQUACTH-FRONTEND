// Smoke test : l'application se monte sans erreur sous le LanguageProvider.
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";

// GamesSection lit les jeux via Supabase : client mocké (aucun réseau).
vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

describe("App", () => {
  it("se monte et affiche le titre du hero (FR par défaut)", () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>,
    );
    // « Origines Mystérieuses » existe aussi en titre de carte de jeu :
    // on cible le <h1> du hero.
    expect(
      screen.getByRole("heading", { level: 1, name: "Origines Mystérieuses" }),
    ).toBeInTheDocument();
  });
});
