// Résout les champs bilingues à plat d'un jeu Supabase (title_fr/title_en,
// short_desc_*, full_desc_*) selon la langue courante. Fonction pure :
// remplace les anciennes clés i18n `games.items.<id>.*` pour le contenu
// venu de la base (les libellés statiques restent dans les JSON i18n).
export function localizeGame(game, lang) {
  const suffixe = lang === "en" ? "en" : "fr";
  return {
    title: game[`title_${suffixe}`] ?? "",
    shortDesc: game[`short_desc_${suffixe}`] ?? "",
    fullDesc: game[`full_desc_${suffixe}`] ?? "",
  };
}
