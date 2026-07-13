// Verrous du gestionnaire de galerie game_media (Prompt 5, item 9) :
// chargement, upload simple/multiple, formats/tailles refusés, rollback Storage
// (réussi et échoué), suppression (réussie et orpheline), alt FR/EN, tri
// Monter/Descendre via RPC transactionnelle, boutons clavier. Supabase 100 %
// mocké : aucune requête réseau réelle.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LanguageProvider from "../i18n/LanguageProvider";
import GameMediaManager from "../components/admin/GameMediaManager";
import fr from "../data/translations/fr.json";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";
import type { GameMediaRow } from "../types/database";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;

const GAME_ID = "11111111-1111-4111-8111-111111111111";
const MEDIA: GameMediaRow[] = [
  {
    id: "m1",
    game_id: GAME_ID,
    storage_path: `${GAME_ID}/a.webp`,
    media_type: "image",
    alt_fr: "Vue A",
    alt_en: "View A",
    sort_order: 0,
    created_at: "2026-07-13T00:00:00Z",
  },
  {
    id: "m2",
    game_id: GAME_ID,
    storage_path: `${GAME_ID}/b.webp`,
    media_type: "image",
    alt_fr: null,
    alt_en: null,
    sort_order: 1,
    created_at: "2026-07-13T00:00:01Z",
  },
];

function renderManager() {
  render(
    <LanguageProvider>
      <GameMediaManager gameId={GAME_ID} />
    </LanguageProvider>,
  );
}

const webp = (name = "img.webp") =>
  new File(["x"], name, { type: "image/webp" });

beforeEach(() => {
  supabase.__reset();
});

describe("GameMediaManager — chargement", () => {
  it("affiche l'état vide", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    expect(await screen.findByText(fr.admin.media.empty)).toBeInTheDocument();
  });

  it("affiche les médias existants (alt pré-remplis)", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    renderManager();
    expect(await screen.findByDisplayValue("Vue A")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("erreur de chargement → message localisé", async () => {
    supabase.__setTable("game_media", { error: { message: "boom" } });
    renderManager();
    expect(await screen.findByText(fr.admin.media.loadError)).toBeInTheDocument();
  });
});

describe("GameMediaManager — upload", () => {
  it("upload simple : upload Storage puis insert de la ligne", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);

    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [webp()] },
    });

    await waitFor(() =>
      expect(supabase.__storageBucket.upload).toHaveBeenCalledTimes(1),
    );
    expect(supabase.__builders.game_media!.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        game_id: GAME_ID,
        media_type: "image",
        sort_order: 0,
      }),
    );
    expect(
      await screen.findByText(fr.admin.media.uploadSuccess),
    ).toBeInTheDocument();
  });

  it("upload multiple : deux fichiers, sort_order incrémenté", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);

    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [webp("a.webp"), webp("b.webp")] },
    });

    await waitFor(() =>
      expect(supabase.__storageBucket.upload).toHaveBeenCalledTimes(2),
    );
    const orders = supabase.__builders
      .game_media!.insert.mock.calls.map((c) => (c[0] as { sort_order: number }).sort_order);
    expect(orders).toEqual([0, 1]);
  });

  it("refuse un format invalide sans téléverser", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);

    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [new File(["x"], "r.pdf", { type: "application/pdf" })] },
    });

    expect(
      await screen.findByText(fr.admin.media.errors.type),
    ).toBeInTheDocument();
    expect(supabase.__storageBucket.upload).not.toHaveBeenCalled();
  });

  it("refuse un fichier de plus de 5 Mo sans téléverser", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);

    const gros = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });
    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [gros] },
    });

    expect(
      await screen.findByText(fr.admin.media.errors.size),
    ).toBeInTheDocument();
    expect(supabase.__storageBucket.upload).not.toHaveBeenCalled();
  });

  it("insert SQL échoué → rollback Storage réussi", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);
    // L'insert échoue désormais (le load a déjà réussi).
    supabase.__setTable("game_media", { error: { message: "insert ko" } });

    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [webp()] },
    });

    expect(
      await screen.findByText(fr.admin.media.errors.insert),
    ).toBeInTheDocument();
    // Compensation : le fichier téléversé est retiré.
    expect(supabase.__storageBucket.remove).toHaveBeenCalled();
  });

  it("insert SQL échoué ET rollback Storage échoué → avertissement orphelin", async () => {
    supabase.__setTable("game_media", { data: [], error: null });
    renderManager();
    await screen.findByText(fr.admin.media.empty);
    supabase.__setTable("game_media", { error: { message: "insert ko" } });
    supabase.__setRemoveError({ message: "storage ko" });

    fireEvent.change(screen.getByLabelText(fr.admin.media.upload), {
      target: { files: [webp()] },
    });

    expect(
      await screen.findByText(fr.admin.media.errors.rollback),
    ).toBeInTheDocument();
  });
});

describe("GameMediaManager — alt, tri, suppression", () => {
  it("enregistre l'alt FR/EN", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    renderManager();
    await screen.findByDisplayValue("Vue A");

    const altEn = screen.getByDisplayValue("View A");
    fireEvent.change(altEn, { target: { value: "New view A" } });
    fireEvent.click(screen.getAllByRole("button", { name: fr.admin.media.saveAlt })[0]!);

    await waitFor(() =>
      expect(supabase.__builders.game_media!.update).toHaveBeenCalledWith(
        expect.objectContaining({ alt_fr: "Vue A", alt_en: "New view A" }),
      ),
    );
    expect(
      await screen.findByText(fr.admin.media.altSuccess),
    ).toBeInTheDocument();
  });

  it("Descendre réordonne via la RPC transactionnelle (ids dans le nouvel ordre)", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    renderManager();
    await screen.findByDisplayValue("Vue A");

    // Bouton « Descendre » du premier média.
    fireEvent.click(screen.getAllByRole("button", { name: /Descendre/ })[0]!);

    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith("reorder_game_media", {
        p_game_id: GAME_ID,
        p_ids: ["m2", "m1"],
      }),
    );
  });

  it("les boutons de tir aux extrémités sont désactivés (tri clavier borné)", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    renderManager();
    await screen.findByDisplayValue("Vue A");

    // Premier média : Monter désactivé ; dernier : Descendre désactivé.
    expect(screen.getAllByRole("button", { name: /Monter/ })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /Descendre/ })[1]).toBeDisabled();
  });

  it("suppression réussie : ligne supprimée puis fichier Storage retiré", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    renderManager();
    await screen.findByDisplayValue("Vue A");

    fireEvent.click(screen.getAllByRole("button", { name: fr.admin.media.delete })[0]!);
    fireEvent.click(screen.getByRole("button", { name: fr.admin.media.confirm }));

    await waitFor(() =>
      expect(supabase.__builders.game_media!.delete).toHaveBeenCalled(),
    );
    expect(supabase.__storageBucket.remove).toHaveBeenCalledWith([
      `${GAME_ID}/a.webp`,
    ]);
    expect(
      await screen.findByText(fr.admin.media.deleteSuccess),
    ).toBeInTheDocument();
  });

  it("suppression partielle : ligne supprimée mais fichier orphelin signalé", async () => {
    supabase.__setTable("game_media", { data: MEDIA, error: null });
    supabase.__setRemoveError({ message: "storage ko" });
    renderManager();
    await screen.findByDisplayValue("Vue A");

    fireEvent.click(screen.getAllByRole("button", { name: fr.admin.media.delete })[0]!);
    fireEvent.click(screen.getByRole("button", { name: fr.admin.media.confirm }));

    expect(
      await screen.findByText(fr.admin.media.errors.deleteOrphan),
    ).toBeInTheDocument();
  });
});
