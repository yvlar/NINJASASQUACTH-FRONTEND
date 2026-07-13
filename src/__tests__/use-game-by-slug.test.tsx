// Verrous du hook useGameBySlug en isolation : chargement → jeu, erreur
// applicative Supabase, jeu absent, et sécurité au démontage (aucune mise à
// jour d'état après unmount). Le rejet réseau et les routes sont couverts par
// game-page.test. Supabase mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useGameBySlug } from "../hooks/useGameBySlug";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase as supabaseClient } from "../lib/supabase";
import type { SupabaseMock } from "./helpers/supabaseMock";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock(), isSupabaseConfigured: true };
});

const supabase = supabaseClient as unknown as SupabaseMock;
const JEU = JEUX_FIXTURES[0];

function Harness({ slug }: { slug: string }) {
  const { game, loading, gameError, mediaError, notFound } =
    useGameBySlug(slug);
  if (loading) return <p>loading</p>;
  if (gameError) return <p>error</p>;
  if (notFound) return <p>notFound</p>;
  return (
    <p>
      game:{game?.title_fr}
      {mediaError ? " mediaError" : ""}
    </p>
  );
}

beforeEach(() => {
  supabase.__reset();
});

describe("useGameBySlug", () => {
  it("résout le jeu correspondant au slug", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    render(<Harness slug={JEU.slug!} />);
    expect(await screen.findByText(`game:${JEU.title_fr}`)).toBeInTheDocument();
  });

  it("signale une erreur applicative Supabase", async () => {
    supabase.__setTable("games", {
      data: null,
      error: { message: "colonne inconnue" },
    });
    render(<Harness slug={JEU.slug!} />);
    expect(await screen.findByText("error")).toBeInTheDocument();
  });

  it("une erreur de galerie n'empêche PAS la fiche (gameError vs mediaError)", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    supabase.__setTable("game_media", {
      data: null,
      error: { message: "galerie indisponible" },
    });
    render(<Harness slug={JEU.slug!} />);
    expect(
      await screen.findByText(`game:${JEU.title_fr} mediaError`),
    ).toBeInTheDocument();
  });

  it("signale un jeu absent (notFound)", async () => {
    supabase.__setTable("games", { data: [], error: null });
    render(<Harness slug="inexistant" />);
    expect(await screen.findByText("notFound")).toBeInTheDocument();
  });

  it("ne met pas à jour l'état après démontage", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(<Harness slug={JEU.slug!} />);
    unmount();
    // laisser les microtâches de la promesse se résoudre après le démontage
    await waitFor(() => expect(true).toBe(true));
    // aucun avertissement React « state update on unmounted component »
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
