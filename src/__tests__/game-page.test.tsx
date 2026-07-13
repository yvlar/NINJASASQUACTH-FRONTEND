// Verrous de la fiche jeu (routes localisées, hook useGameBySlug) :
// route FR, route EN, jeu trouvé, jeu absent (404), rejet réseau, PDF
// présent/absent, changement de langue conservant le slug. Supabase mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageProvider from "../i18n/LanguageProvider";
import AppRoutes from "../AppRoutes";
import fr from "../data/translations/fr.json";
import en from "../data/translations/en.json";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";
import type { GameRow } from "../types/database";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;

const JEU = JEUX_FIXTURES[0]; // slug "origines-mysterieuses"

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  supabase.__reset();
});

describe("Fiche jeu — routes localisées", () => {
  it("route FR /fr/jeux/:slug rend le jeu trouvé (titre FR en h1)", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    expect(
      await screen.findByRole("heading", { level: 1, name: JEU.title_fr }),
    ).toBeInTheDocument();
  });

  it("route EN /en/games/:slug rend le jeu trouvé (titre EN en h1)", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderAt(`/en/games/${JEU.slug}`);
    expect(
      await screen.findByRole("heading", { level: 1, name: JEU.title_en }),
    ).toBeInTheDocument();
  });

  it("jeu absent → vraie page 404", async () => {
    supabase.__setTable("games", { data: [], error: null });
    renderAt("/fr/jeux/inexistant");
    expect(
      await screen.findByRole("heading", { name: fr.notFound.title }),
    ).toBeInTheDocument();
  });

  it("rejet réseau → état d'erreur (pas de blocage sur Chargement…)", async () => {
    supabase.__setTable("games", { reject: new Error("réseau coupé") });
    renderAt(`/fr/jeux/${JEU.slug}`);
    expect(await screen.findByRole("alert")).toHaveTextContent(fr.games.error);
  });

  it("PDF présent → lien de téléchargement annonçant le format PDF", async () => {
    const avecPdf: GameRow = { ...JEU, rules_pdf_fr: "/rules/origines-fr.pdf" };
    supabase.__setTable("games", { data: [avecPdf], error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    const lien = await screen.findByRole("link", {
      name: fr.games.detail.download,
    });
    expect(lien).toHaveAttribute("href", "/rules/origines-fr.pdf");
  });

  it("PDF absent → mention « bientôt disponible », aucun lien mort", async () => {
    supabase.__setTable("games", { data: [JEU], error: null }); // rules_pdf_fr null
    renderAt(`/fr/jeux/${JEU.slug}`);
    expect(
      await screen.findByText(fr.games.detail.rulesComingSoon),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: fr.games.detail.download }),
    ).not.toBeInTheDocument();
  });

  it("badge « contenu en anglais » quand le matériel est en anglais seulement", async () => {
    const enOnly: GameRow = {
      ...JEU,
      game_languages: ["en"],
      theme_key: "heroes-rising",
    };
    supabase.__setTable("games", { data: [enOnly], error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    await screen.findByRole("heading", { level: 1, name: JEU.title_fr });
    expect(screen.getByText(fr.games.englishContent)).toBeInTheDocument();
  });

  it("pas de badge « contenu en anglais » quand le matériel est bilingue", async () => {
    // fixture 0 : game_languages ["fr", "en"] → bilingue
    supabase.__setTable("games", { data: [JEU], error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    await screen.findByRole("heading", { level: 1, name: JEU.title_fr });
    expect(screen.queryByText(fr.games.englishContent)).not.toBeInTheDocument();
  });

  it("affiche la section crédits (crédit studio, rien d'inventé)", async () => {
    supabase.__setTable("games", { data: [JEU], error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    await screen.findByRole("heading", { level: 1, name: JEU.title_fr });
    expect(
      screen.getByRole("heading", { name: fr.games.detail.credits }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(fr.games.detail.creditsStudio),
    ).toBeInTheDocument();
  });

  it("changement de langue conserve le slug (/fr/jeux/x → /en/games/x)", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    renderAt(`/fr/jeux/${JEU.slug}`);
    await screen.findByRole("heading", { level: 1, name: JEU.title_fr });

    fireEvent.click(
      screen.getByRole("button", { name: fr.nav.switchLanguage }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: JEU.title_en }),
    ).toBeInTheDocument();
    // le sous-titre anglais confirme la bascule
    expect(screen.getByText(en.games.detail.summary)).toBeInTheDocument();
  });
});
