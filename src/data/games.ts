// Catégories du catalogue — contrat partagé entre le filtre du site public,
// le formulaire admin et les libellés i18n (games.categories.<id>).
// Les ids (accents compris, ex. « stratégie ») sont significatifs
// byte-for-byte : ils doivent correspondre aux clés JSON des deux langues
// ET à la contrainte CHECK de la table Supabase `games` — le type
// CatalogCategoryId (src/types/database.ts) porte ce contrat à la
// compilation, la migration tracée le porte côté base
// (supabase/migrations/20260708032500_init_games_auth.sql).
// « tous » est un pseudo-filtre (voir tout) : jamais porté par un jeu.
//
// Les jeux eux-mêmes vivent dans Supabase (table `games`, contenu bilingue
// à plat *_fr/*_en) : lecture via src/hooks/useGames.js, localisation via
// src/utils/localizeGame.js, gestion via l'admin (/admin).
import type { CatalogCategoryId } from "../types/database";

export const categories: ReadonlyArray<{ id: CatalogCategoryId }> = [
  { id: "tous" },
  { id: "famille" },
  { id: "stratégie" },
  { id: "party" },
];
