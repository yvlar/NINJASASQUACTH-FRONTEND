// Résout les champs bilingues à plat d'un jeu Supabase (title_fr/title_en,
// short_desc_*, full_desc_*) selon la langue courante. Fonction pure :
// remplace les anciennes clés i18n `games.items.<id>.*` pour le contenu
// venu de la base (les libellés statiques restent dans les JSON i18n).
import type { GameRow } from "../types/database";

// Le contrat verrouillé par localize-game.test : champs manquants → "",
// langue inconnue → repli sur le français. `lang` reste donc un string
// libre et les champs sont optionnels (GameRow y est assignable).
type BilingualGameFields = Partial<
  Pick<
    GameRow,
    | "title_fr"
    | "title_en"
    | "short_desc_fr"
    | "short_desc_en"
    | "full_desc_fr"
    | "full_desc_en"
  >
>;

export interface LocalizedGame {
  title: string;
  shortDesc: string;
  fullDesc: string;
}

export function localizeGame(
  game: BilingualGameFields,
  lang: string,
): LocalizedGame {
  const en = lang === "en";
  return {
    title: (en ? game.title_en : game.title_fr) ?? "",
    shortDesc: (en ? game.short_desc_en : game.short_desc_fr) ?? "",
    fullDesc: (en ? game.full_desc_en : game.full_desc_fr) ?? "",
  };
}
