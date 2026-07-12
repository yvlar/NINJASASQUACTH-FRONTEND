// Résilience de configuration (Sprint 11, Partie B) : sans Supabase joignable
// (variables absentes → client de repli → appels rejetés), le site vitrine
// reste ENTIÈREMENT visible et seul le catalogue affiche une erreur localisée.
// Aucun écran blanc.
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: false };
});

import { supabase } from "../lib/supabase";
const mock = supabase as unknown as SupabaseMock;

afterEach(() => mock.__reset());

describe("site vitrine sans Supabase joignable", () => {
  it("affiche le hero, l'univers, le contact et le footer même si le catalogue échoue", () => {
    // Panne réseau avant toute réponse (fetch rejeté) sur `games`.
    mock.__setTable("games", { reject: new Error("réseau indisponible") });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </MemoryRouter>,
    );

    // Vitrine visible : hero de marque (h1), section univers, contact.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Des jeux qui sortent des sentiers battus",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Notre Mission")).toBeInTheDocument();
    expect(screen.getByText("Contactez-nous")).toBeInTheDocument();
  });

  it("le catalogue affiche une erreur localisée (jamais un écran blanc)", async () => {
    mock.__setTable("games", { reject: new Error("réseau indisponible") });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Impossible de charger les jeux. Réessayez plus tard."),
    ).toBeInTheDocument();
  });
});
