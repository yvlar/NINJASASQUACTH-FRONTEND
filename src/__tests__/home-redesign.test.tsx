// Verrous de la refonte de l'accueil (Sprint 10) : hero vedette alimenté par
// Supabase (Heroes Rising prioritaire), statut de campagne, badge « contenu en
// anglais », repli de marque sobre sur base vide, bandeau de réassurance,
// section fondateur sans photo inventée, notification de lancement sans lien
// Kickstarter fictif. Client 100 % mocké — aucun réseau.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import LanguageProvider from "../i18n/LanguageProvider";
import { JEUX_FIXTURES } from "./fixtures/games";
import { gamePath } from "../utils/routes";
import fr from "../data/translations/fr.json";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";
import type { GameRow } from "../types/database";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;

// Jeu Heroes Rising : campagne à venir, matériel en anglais seulement, sans
// image officielle → le hero doit basculer sur une composition de marque.
const heroesRising: GameRow = {
  ...JEUX_FIXTURES[0],
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  slug: "heroes-rising",
  title_fr: "Heroes Rising",
  title_en: "Heroes Rising",
  tagline_fr: "L'ascension des héros",
  tagline_en: "The heroes rise",
  theme_key: "heroes-rising",
  campaign_status: "coming-soon",
  kickstarter_url: null,
  game_languages: ["en"],
  featured_order: 1,
  image_url: null,
};

beforeEach(() => {
  supabase.__reset();
});

const renderApp = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>,
  );

describe("Hero vedette alimenté par Supabase", () => {
  it("met en vedette Heroes Rising (titre h1, accroche, statut de campagne)", async () => {
    supabase.__setTable("games", { data: [heroesRising], error: null });
    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Heroes Rising" }),
    ).toBeInTheDocument();
    expect(screen.getByText("L'ascension des héros")).toBeInTheDocument();
    expect(
      screen.getByText(fr.games.detail.campaign["coming-soon"]),
    ).toBeInTheDocument();
  });

  it("affiche le badge « contenu en anglais » et les deux CTA", async () => {
    supabase.__setTable("games", { data: [heroesRising], error: null });
    renderApp();
    await screen.findByRole("heading", { level: 1, name: "Heroes Rising" });

    expect(screen.getByText(fr.games.englishContent)).toBeInTheDocument();
    // CTA principal (présent dans le hero ET la section notification)
    expect(
      screen.getAllByRole("button", { name: fr.home.hero.notify }).length,
    ).toBeGreaterThan(0);
    // CTA secondaire → fiche du jeu
    const discover = screen.getByRole("link", {
      name: fr.home.hero.discoverGame,
    });
    expect(discover).toHaveAttribute("href", gamePath("fr", "heroes-rising"));
  });

  it("retombe sur un hero de marque sobre quand la base est vide", async () => {
    supabase.__setTable("games", { data: [], error: null });
    renderApp();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: fr.home.hero.brandTitle,
      }),
    ).toBeInTheDocument();
    // Aucun jeu vedette → aucun lien « Découvrir le jeu ».
    expect(
      screen.queryByRole("link", { name: fr.home.hero.discoverGame }),
    ).not.toBeInTheDocument();
  });
});

describe("Sections de l'accueil refondu", () => {
  it("le bandeau de réassurance affiche les trois promesses validées", async () => {
    supabase.__setTable("games", { data: [], error: null });
    renderApp();

    // « Fait au Québec » existe aussi dans les stats « à propos » : on scope
    // le bandeau par son aria-label.
    const banner = screen
      .getByText(fr.reassurance.items.strategy)
      .closest("section")!;
    const inBanner = within(banner);
    expect(inBanner.getByText(fr.reassurance.items.strategy)).toBeInTheDocument();
    expect(inBanner.getByText(fr.reassurance.items.quebec)).toBeInTheDocument();
    expect(inBanner.getByText(fr.reassurance.items.eco)).toBeInTheDocument();
  });

  it("la section fondateur n'invente aucune photo", async () => {
    supabase.__setTable("games", { data: [], error: null });
    renderApp();

    const heading = screen.getByRole("heading", { name: fr.founder.title });
    const section = heading.closest("section")!;
    expect(section.querySelector("img")).toBeNull();
  });

  it("la notification n'affiche pas de lien Kickstarter sans URL publique", async () => {
    supabase.__setTable("games", { data: [heroesRising], error: null });
    renderApp();
    await screen.findByRole("heading", { name: fr.newsletter.title });

    expect(
      screen.queryByRole("link", { name: fr.games.detail.kickstarterCta }),
    ).not.toBeInTheDocument();
  });

  it("la notification affiche le lien Kickstarter quand une URL publique existe", async () => {
    const live: GameRow = {
      ...heroesRising,
      campaign_status: "live",
      kickstarter_url: "https://www.kickstarter.com/projects/nsg/heroes-rising",
    };
    supabase.__setTable("games", { data: [live], error: null });
    renderApp();

    const link = await screen.findByRole("link", {
      name: fr.games.detail.kickstarterCta,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.kickstarter.com/projects/nsg/heroes-rising",
    );
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });
});
