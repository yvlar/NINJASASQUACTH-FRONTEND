// Verrou de la lecture publique des jeux depuis Supabase : chargement,
// erreur, base vide (décision 5.F : pas de seed) et rendu localisé des
// cartes selon la langue. Client 100 % mocké — aucun réseau.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import GamesSection from "../components/sections/Games";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

const renderSection = () =>
  render(
    <LanguageProvider>
      <GamesSection />
    </LanguageProvider>,
  );

beforeEach(() => {
  supabase.__reset();
});

describe("GamesSection branchée sur Supabase", () => {
  it("affiche l'état vide propre quand la base ne contient aucun jeu", async () => {
    supabase.__setTable("games", { data: [], error: null });
    renderSection();

    expect(await screen.findByText(fr.games.empty)).toBeInTheDocument();
  });

  it("affiche l'état d'erreur si la lecture échoue", async () => {
    supabase.__setTable("games", {
      data: null,
      error: { message: "réseau indisponible" },
    });
    renderSection();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      fr.games.error,
    );
  });

  it("rend les cartes localisées en FR puis en EN après bascule", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderSection();

    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: JEUX_FIXTURES[0].title_fr,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(JEUX_FIXTURES[1].short_desc_fr),
    ).toBeInTheDocument();
  });

  it("filtre toujours par catégorie (IDs accentués)", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderSection();
    await screen.findByRole("heading", {
      level: 3,
      name: JEUX_FIXTURES[0].title_fr,
    });

    fireEvent.click(
      screen.getByRole("button", { name: fr.games.categories["stratégie"] }),
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Mission Ninja" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Festin Forestier" }),
    ).not.toBeInTheDocument();
  });

  it("ouvre la vue détail avec la description complète localisée", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderSection();

    fireEvent.click(
      await screen.findByRole("heading", {
        level: 3,
        name: JEUX_FIXTURES[0].title_fr,
      }),
    );

    expect(
      screen.getByText(JEUX_FIXTURES[0].full_desc_fr),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(fr.games.categories.famille)),
    ).toBeInTheDocument();
  });
});

describe("parité des états i18n", () => {
  it("les clés loading/empty/error existent dans les deux langues", () => {
    for (const messages of [fr, en]) {
      expect(messages.games.loading).toBeTruthy();
      expect(messages.games.empty).toBeTruthy();
      expect(messages.games.error).toBeTruthy();
    }
  });
});
