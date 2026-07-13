// Contexte de catalogue partagé (Sprint 11.1) : l'accueil charge les jeux UNE
// seule fois (GamesProvider) puis les trois sections (Hero, GamesSection,
// NewsletterSection) lisent le même état — fini les trois requêtes identiques.
// Fichier séparé du provider pour rester conforme à react-refresh.
import { createContext } from "react";
import type { UseGamesResult } from "./useGames";

export const GamesContext = createContext<UseGamesResult | null>(null);
