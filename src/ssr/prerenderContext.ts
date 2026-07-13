// Amorce de données pour le PRÉ-RENDU (Sprint 11, Partie A). Au build, les
// jeux publiés sont lus une fois (clé publiable) puis fournis via ce contexte :
// `useGames`/`useGameBySlug` retournent alors la donnée SYNCHRONEMENT (pas
// d'effet, pas de réseau) → le HTML produit contient le vrai contenu (H1,
// texte, liens) et pas seulement un état de chargement.
//
// Côté client, aucun Provider n'entoure l'app → le contexte vaut `null` et les
// hooks reprennent leur comportement de fetch habituel. Le contrat existant
// est donc préservé (les tests ne montent aucun Provider).
import { createContext, useContext } from "react";
import type { GameMediaRow, GameRow } from "../types/database";

export interface PrerenderData {
  games: GameRow[];
  // Médias indexés par game_id (ce que lit useGameBySlug).
  media: Record<string, GameMediaRow[]>;
}

export const PrerenderContext = createContext<PrerenderData | null>(null);

export function usePrerenderData(): PrerenderData | null {
  return useContext(PrerenderContext);
}
