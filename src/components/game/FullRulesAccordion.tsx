// Règles complètes : la description longue localisée, repliée dans un
// <details> natif (accessible clavier sans JS). Masqué si vide.
import { useLanguage } from "../../i18n/useLanguage";
import { localizeGame } from "../../utils/localizeGame";
import type { GameRow } from "../../types/database";

export default function FullRulesAccordion({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const { fullDesc } = localizeGame(game, lang);
  if (!fullDesc) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <details className="rounded-lg border border-dark-green/20 bg-white p-4">
        <summary className="cursor-pointer text-xl font-bold text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green">
          {t("games.detail.fullRules")}
        </summary>
        <p className="mt-3 whitespace-pre-line text-dark-green">{fullDesc}</p>
      </details>
    </section>
  );
}
