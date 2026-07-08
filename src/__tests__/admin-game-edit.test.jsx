// Verrous de l'édition et de la suppression de jeux dans l'admin :
// formulaire pré-rempli, update sur le bon id (image conservée sans nouveau
// fichier), suppression seulement après confirmation. Supabase 100 % mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import GamesManager from "../components/admin/GamesManager";
import GameForm from "../components/admin/GameForm";
import fr from "../data/translations/fr.json";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

const JEU = {
  id: "jeu-42",
  category: "party",
  title_fr: "Fous Rires Garantis",
  title_en: "Guaranteed Laughs",
  short_desc_fr: "Courte FR",
  short_desc_en: "Short EN",
  full_desc_fr: "Longue FR",
  full_desc_en: "Long EN",
  players: "3-8",
  duration: "20-30 min",
  age: "12+",
  eco: true,
  published: false,
  image_url: "https://exemple.supabase.co/public/game-images/existante.webp",
};

beforeEach(() => {
  supabase.__reset();
});

describe("GameForm (édition)", () => {
  it("pré-remplit le formulaire avec le jeu existant", () => {
    render(
      <LanguageProvider>
        <GameForm game={JEU} onSaved={vi.fn()} onCancel={vi.fn()} />
      </LanguageProvider>,
    );

    expect(screen.getByLabelText(fr.admin.form.title_fr)).toHaveValue(
      JEU.title_fr,
    );
    expect(screen.getByLabelText(fr.admin.form.category)).toHaveValue("party");
    expect(screen.getByLabelText(fr.admin.form.published)).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: fr.admin.form.submitEdit }),
    ).toBeInTheDocument();
  });

  it("met à jour le bon jeu et conserve l'image sans nouveau fichier", async () => {
    const onSaved = vi.fn();
    render(
      <LanguageProvider>
        <GameForm game={JEU} onSaved={onSaved} onCancel={vi.fn()} />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText(fr.admin.form.title_fr), {
      target: { value: "Fous Rires Assurés" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.form.submitEdit }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(supabase.__builders.games.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title_fr: "Fous Rires Assurés",
        image_url: JEU.image_url,
      }),
    );
    expect(supabase.__builders.games.eq).toHaveBeenCalledWith("id", JEU.id);
    expect(supabase.__storageBucket.upload).not.toHaveBeenCalled();
    expect(supabase.__builders.games.insert).not.toHaveBeenCalled();
  });
});

describe("GamesManager (suppression)", () => {
  it("ne supprime qu'après confirmation explicite", async () => {
    supabase.__setTable("games", { data: [JEU], error: null });
    render(
      <LanguageProvider>
        <GamesManager />
      </LanguageProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: `${fr.admin.manager.delete} : ${JEU.title_fr}`,
      }),
    );
    // la demande de confirmation est visible, rien n'est encore supprimé
    expect(screen.getByText(fr.admin.manager.confirmDelete)).toBeInTheDocument();
    expect(supabase.__builders.games.delete).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.manager.confirm }),
    );

    await waitFor(() =>
      expect(supabase.__builders.games.delete).toHaveBeenCalled(),
    );
    expect(supabase.__builders.games.eq).toHaveBeenCalledWith("id", JEU.id);
  });

  it("ouvre le formulaire pré-rempli au clic sur Modifier", async () => {
    supabase.__setTable("games", { data: [JEU], error: null });
    render(
      <LanguageProvider>
        <GamesManager />
      </LanguageProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: `${fr.admin.manager.edit} : ${JEU.title_fr}`,
      }),
    );

    expect(
      await screen.findByLabelText(fr.admin.form.title_en),
    ).toHaveValue(JEU.title_en);
  });
});
