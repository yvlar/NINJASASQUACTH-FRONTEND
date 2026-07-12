// Crédits de la fiche : uniquement le crédit studio réel (aucun crédit
// nominatif inventé — la spec produit détaillée est absente, D21). Donne à
// chaque fiche la même structure de bas de page.
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function GameCredits({ game }: { game: GameRow }) {
  const { t } = useLanguage();
  // `game` réservé pour d'éventuels crédits par jeu (illustrateurs, autrices…)
  // le jour où la donnée existera en base — rien n'est inventé aujourd'hui.
  void game;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">{t("games.detail.credits")}</h2>
      <p className="text-charcoal">{t("games.detail.creditsStudio")}</p>
    </section>
  );
}
