// Fournit le catalogue une seule fois à l'arbre de l'accueil : un unique
// useGames() (donc une seule requête, ou une seule lecture d'amorce de
// pré-rendu) partagé par Hero, GamesSection et NewsletterSection.
import type { ReactNode } from "react";
import { useGames } from "./useGames";
import { GamesContext } from "./gamesContext";

export default function GamesProvider({ children }: { children: ReactNode }) {
  const value = useGames();
  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
}
