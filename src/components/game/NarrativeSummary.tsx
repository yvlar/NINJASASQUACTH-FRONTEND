// Résumé narratif (MARKETING) : l'accroche courte + la description longue
// localisées, présentées comme une présentation du jeu. Ce n'est PAS des
// règles (celles-ci vivent dans FullRulesAccordion via rules_summary_*).
// Masqué si aucun texte marketing.
import { useLanguage } from "../../i18n/useLanguage";
import { localizeGame } from "../../utils/localizeGame";
import type { GameRow } from "../../types/database";

export default function NarrativeSummary({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const { shortDesc, fullDesc } = localizeGame(game, lang);
  if (!shortDesc && !fullDesc) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">{t("games.detail.summary")}</h2>
      {shortDesc && (
        <p className="text-lg/[1.6] text-charcoal">{shortDesc}</p>
      )}
      {fullDesc && (
        <p className="mt-3 whitespace-pre-line text-charcoal/90">{fullDesc}</p>
      )}
    </section>
  );
}
