// Verrou anti-duplication (Sprint 11.1) : l'accueil ne lance qu'UNE lecture du
// catalogue, partagée par Hero, GamesSection et NewsletterSection (via
// GamesProvider) — plus trois requêtes `from("games")` identiques.
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;

describe("accueil — lecture unique du catalogue", () => {
  it("n'appelle from(\"games\") qu'une seule fois", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </MemoryRouter>,
    );
    const gamesCalls = (supabase.from as unknown as { mock: { calls: unknown[][] } })
      .mock.calls.filter((args) => args[0] === "games");
    expect(gamesCalls).toHaveLength(1);
  });
});
