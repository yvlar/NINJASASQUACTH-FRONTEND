// Verrous de la création de jeux dans l'admin : payload d'insertion exact
// (champs bilingues, catégorie accentuée), fichier invalide bloqué AVANT
// tout upload, parité FR/EN obligatoire à la saisie. Supabase 100 % mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import GamesManager from "../components/admin/GamesManager";
import GameForm from "../components/admin/GameForm";
import fr from "../data/translations/fr.json";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

// Cast unique : sous vi.mock, ce module est en réalité le mock complet
// (méthodes __* incluses), pas le client Supabase typé.
const supabase = supabaseClient as unknown as SupabaseMock;

const CHAMPS_TEXTE = {
  title_fr: "Sentiers Sauvages",
  title_en: "Wild Trails",
  short_desc_fr: "Une exploration coopérative.",
  short_desc_en: "A cooperative exploration.",
  full_desc_fr: "Description complète en français.",
  full_desc_en: "Full description in English.",
  players: "2-4",
  duration: "45 min",
  age: "10+",
};

function renderForm(onSaved = vi.fn()) {
  render(
    <LanguageProvider>
      <GameForm onSaved={onSaved} onCancel={vi.fn()} />
    </LanguageProvider>,
  );
  return onSaved;
}

function remplirTexte(sauf: string[] = []) {
  const entrees = Object.entries(CHAMPS_TEXTE) as [
    keyof typeof CHAMPS_TEXTE,
    string,
  ][];
  for (const [nom, valeur] of entrees) {
    if (sauf.includes(nom)) continue;
    fireEvent.change(screen.getByLabelText(fr.admin.form[nom]), {
      target: { value: valeur },
    });
  }
}

function soumettre() {
  fireEvent.click(
    screen.getByRole("button", { name: fr.admin.form.submitCreate }),
  );
}

beforeEach(() => {
  supabase.__reset();
});

describe("GamesManager (liste admin)", () => {
  it("affiche l'état vide quand la base ne contient aucun jeu", async () => {
    supabase.__setTable("games", { data: [], error: null });
    render(
      <LanguageProvider>
        <GamesManager />
      </LanguageProvider>,
    );

    expect(
      await screen.findByText(fr.admin.manager.empty),
    ).toBeInTheDocument();
  });

  it("liste les jeux (brouillons compris) et ouvre le formulaire de création", async () => {
    supabase.__setTable("games", {
      data: [
        {
          id: "a1",
          category: "stratégie",
          title_fr: "Jeu publié",
          title_en: "Published game",
          published: true,
        },
        {
          id: "b2",
          category: "party",
          title_fr: "Jeu brouillon",
          title_en: "Draft game",
          published: false,
        },
      ],
      error: null,
    });
    render(
      <LanguageProvider>
        <GamesManager />
      </LanguageProvider>,
    );

    expect(await screen.findByText("Jeu publié")).toBeInTheDocument();
    expect(screen.getByText("Jeu brouillon")).toBeInTheDocument();
    expect(screen.getByText(fr.admin.manager.draft)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: fr.admin.manager.newGame }),
    );
    expect(
      await screen.findByLabelText(fr.admin.form.title_fr),
    ).toBeInTheDocument();
  });
});

describe("GameForm (création)", () => {
  it("insère le payload exact — champs bilingues et catégorie accentuée", async () => {
    const onSaved = renderForm();
    remplirTexte();
    fireEvent.change(screen.getByLabelText(fr.admin.form.category), {
      target: { value: "stratégie" },
    });
    soumettre();

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(supabase.__builders.games!.insert).toHaveBeenCalledWith({
      ...CHAMPS_TEXTE,
      category: "stratégie",
      eco: true,
      published: true,
      image_url: null,
    });
  });

  it("bloque la soumission si un champ anglais manque (parité FR/EN)", async () => {
    renderForm();
    remplirTexte(["title_en"]);
    soumettre();

    expect(
      await screen.findAllByText(fr.admin.form.errors.required),
    ).not.toHaveLength(0);
    expect(supabase.__builders.games?.insert ?? vi.fn()).not.toHaveBeenCalled();
  });

  it("refuse un fichier au mauvais format sans lancer d'upload", async () => {
    renderForm();
    remplirTexte();
    const fichier = new File(["contenu"], "regles.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [fichier] },
    });
    soumettre();

    expect(
      await screen.findByText(fr.admin.form.errors.imageType),
    ).toBeInTheDocument();
    expect(supabase.storage.from).not.toHaveBeenCalled();
    expect(supabase.__builders.games?.insert ?? vi.fn()).not.toHaveBeenCalled();
  });

  it("refuse un fichier de plus de 5 Mo sans lancer d'upload", async () => {
    renderForm();
    remplirTexte();
    const gros = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], "photo.png", {
      type: "image/png",
    });
    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [gros] },
    });
    soumettre();

    expect(
      await screen.findByText(fr.admin.form.errors.imageSize),
    ).toBeInTheDocument();
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it("téléverse la photo valide puis insère son URL publique", async () => {
    const onSaved = renderForm();
    remplirTexte();
    const photo = new File(["image"], "photo.webp", { type: "image/webp" });
    fireEvent.change(screen.getByLabelText(fr.admin.form.image), {
      target: { files: [photo] },
    });
    soumettre();

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(supabase.__storageBucket.upload).toHaveBeenCalled();
    expect(supabase.__builders.games!.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        image_url:
          "https://exemple.supabase.co/storage/v1/object/public/game-images/photo.webp",
      }),
    );
  });
});
