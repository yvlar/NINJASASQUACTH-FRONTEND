// Verrou du hook useGames : chargement puis données, ou état d'erreur.
// Le filtrage `published` est porté par la RLS côté Supabase — le hook ne
// filtre rien. Client 100 % mocké.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useGames } from "../hooks/useGames";
import { JEUX_FIXTURES } from "./fixtures/games";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", async () => {
  const { makeSupabaseMock } = await import("./helpers/supabaseMock");
  return { supabase: makeSupabaseMock() };
});

function Sonde() {
  const { games, loading, error } = useGames();
  if (loading) return <p>état chargement</p>;
  if (error) return <p>état erreur</p>;
  return <p>{games.length} jeux chargés</p>;
}

beforeEach(() => {
  supabase.__reset();
});

describe("useGames", () => {
  it("expose le chargement puis les jeux", async () => {
    supabase.__setTable("games", { data: JEUX_FIXTURES, error: null });
    render(<Sonde />);

    expect(screen.getByText("état chargement")).toBeInTheDocument();
    expect(
      await screen.findByText(`${JEUX_FIXTURES.length} jeux chargés`),
    ).toBeInTheDocument();
  });

  it("expose l'état d'erreur si la lecture échoue", async () => {
    supabase.__setTable("games", {
      data: null,
      error: { message: "réseau indisponible" },
    });
    render(<Sonde />);

    expect(await screen.findByText("état erreur")).toBeInTheDocument();
  });

  it("expose une liste vide sur base vide (aucune erreur)", async () => {
    supabase.__setTable("games", { data: [], error: null });
    render(<Sonde />);

    expect(await screen.findByText("0 jeux chargés")).toBeInTheDocument();
  });
});
