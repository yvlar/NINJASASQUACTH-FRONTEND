// Lecture du catalogue partagé de l'accueil. À utiliser dans les sections
// enveloppées par <GamesProvider> (Hero, GamesSection, NewsletterSection).
// Hors provider, on retombe sur un état vide non chargé (défensif) plutôt que
// de déclencher une requête concurrente — l'accueil fournit TOUJOURS le
// provider.
import { useContext } from "react";
import { GamesContext } from "./gamesContext";
import type { UseGamesResult } from "./useGames";

const EMPTY: UseGamesResult = { games: [], loading: false, error: null };

export function useSharedGames(): UseGamesResult {
  return useContext(GamesContext) ?? EMPTY;
}
