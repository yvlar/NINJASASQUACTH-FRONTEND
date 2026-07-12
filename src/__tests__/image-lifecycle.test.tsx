// Verrous de l'intégrité des images Storage : plus d'orphelins.
// - util pur imagePathFromPublicUrl
// - GameForm : rollback du fichier téléversé si l'écriture SQL échoue,
//   suppression de l'ancienne image seulement APRÈS une mise à jour réussie
// - GamesManager : suppression des fichiers associés au jeu supprimé,
//   signalement clair d'un nettoyage échoué
// Supabase 100 % mocké (aucun réseau).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import GameForm from "../components/admin/GameForm";
import GamesManager from "../components/admin/GamesManager";
import fr from "../data/translations/fr.json";
import { JEUX_FIXTURES } from "./fixtures/games";
import { imagePathFromPublicUrl } from "../utils/storagePath";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

const supabase = supabaseClient as unknown as SupabaseMock;

// image_url = "https://exemple.supabase.co/public/game-images/origines.webp"
const JEU = JEUX_FIXTURES[0];
const CHEMIN_ANCIEN = "origines.webp";

const nouveauFichier = () =>
  new File(["image"], "nouvelle.webp", { type: "image/webp" });

beforeEach(() => {
  supabase.__reset();
});

describe("imagePathFromPublicUrl", () => {
  it("extrait le chemin bucket-relatif d'une URL publique", () => {
    expect(
      imagePathFromPublicUrl(
        "https://x.supabase.co/storage/v1/object/public/game-images/abc.webp",
      ),
    ).toBe("abc.webp");
  });

  it("renvoie null pour une URL nulle ou hors bucket", () => {
    expect(imagePathFromPublicUrl(null)).toBeNull();
    expect(imagePathFromPublicUrl("https://ailleurs.test/img.png")).toBeNull();
  });
});

describe("GameForm — rollback de l'image après erreur SQL", () => {
  it("supprime le fichier téléversé quand l'update échoue", async () => {
    // upload OK, update en erreur
    supabase.__setTable("games", {
      data: null,
      error: { message: "écriture refusée" },
    });
    const onSaved = vi.fn();
    render(
      <LanguageProvider>
        <GameForm game={JEU} onSaved={onSaved} onCancel={vi.fn()} />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [nouveauFichier()] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.form.submitEdit }),
    );

    // le fichier tout juste téléversé est retiré (compensation)
    await waitFor(() =>
      expect(supabase.__storageBucket.remove).toHaveBeenCalled(),
    );
    expect(
      await screen.findByText(fr.admin.form.errors.save),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    // l'ancienne image n'est PAS supprimée (l'écriture a échoué)
    expect(supabase.__storageBucket.remove).not.toHaveBeenCalledWith([
      CHEMIN_ANCIEN,
    ]);
  });

  it("signale une erreur claire si le nettoyage compensatoire échoue aussi", async () => {
    supabase.__setTable("games", {
      data: null,
      error: { message: "écriture refusée" },
    });
    supabase.__setRemoveError({ message: "storage indisponible" });
    render(
      <LanguageProvider>
        <GameForm game={JEU} onSaved={vi.fn()} onCancel={vi.fn()} />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [nouveauFichier()] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.form.submitEdit }),
    );

    expect(
      await screen.findByText(fr.admin.form.errors.cleanup),
    ).toBeInTheDocument();
  });
});

describe("GameForm — remplacement d'image", () => {
  it("supprime l'ancienne image seulement après une mise à jour réussie", async () => {
    supabase.__setTable("games", { data: null, error: null });
    const onSaved = vi.fn();
    render(
      <LanguageProvider>
        <GameForm game={JEU} onSaved={onSaved} onCancel={vi.fn()} />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [nouveauFichier()] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.form.submitEdit }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    // l'ancienne image est retirée APRÈS le succès de l'update
    expect(supabase.__storageBucket.remove).toHaveBeenCalledWith([
      CHEMIN_ANCIEN,
    ]);
  });
});

describe("GamesManager — suppression des fichiers du jeu", () => {
  it("retire la photo principale et les médias associés", async () => {
    supabase.__setTable("games", { data: [JEU], error: null });
    supabase.__setTable("game_media", {
      data: [{ storage_path: "media-1.jpg" }, { storage_path: "media-2.jpg" }],
      error: null,
    });
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
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.manager.confirm }),
    );

    await waitFor(() =>
      expect(supabase.__builders.games!.delete).toHaveBeenCalled(),
    );
    expect(supabase.__storageBucket.remove).toHaveBeenCalledWith([
      CHEMIN_ANCIEN,
      "media-1.jpg",
      "media-2.jpg",
    ]);
  });

  it("signale un nettoyage échoué sans prétendre à l'échec de la suppression", async () => {
    supabase.__setTable("games", { data: [JEU], error: null });
    supabase.__setTable("game_media", { data: [], error: null });
    supabase.__setRemoveError({ message: "storage indisponible" });
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
    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.manager.confirm }),
    );

    expect(
      await screen.findByText(fr.admin.manager.cleanupError),
    ).toBeInTheDocument();
  });
});
