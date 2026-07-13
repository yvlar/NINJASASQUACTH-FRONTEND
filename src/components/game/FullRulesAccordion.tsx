// Règles du jeu : la SYNTHÈSE de règles réelles (rules_summary_*) — objectif,
// mise en place, tour de jeu, fin de partie, victoire —, repliée dans un
// <details> natif (accessible clavier sans JS). N'utilise JAMAIS la description
// marketing (full_desc_*) : celle-ci reste une présentation, pas des règles.
// Masqué tant qu'aucune règle réelle n'est fournie (le PDF, s'il existe, est
// servi par RulesDownload ; sinon « Règles bientôt disponibles » y est affiché).
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function FullRulesAccordion({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const rules =
    (lang === "en" ? game.rules_summary_en : game.rules_summary_fr) ?? "";
  if (!rules.trim()) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <details className="rounded-lg border border-charcoal/20 bg-white p-4">
        <summary className="cursor-pointer text-xl font-bold text-roux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
          {t("games.detail.fullRules")}
        </summary>
        <p className="mt-3 whitespace-pre-line text-charcoal">{rules}</p>
      </details>
    </section>
  );
}
