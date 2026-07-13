// Résumé narratif : la description courte localisée, présentée comme intro.
import { useLanguage } from "../../i18n/useLanguage";
import { localizeGame } from "../../utils/localizeGame";
import type { GameRow } from "../../types/database";

export default function NarrativeSummary({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const { shortDesc } = localizeGame(game, lang);
  if (!shortDesc) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">
        {t("games.detail.summary")}
      </h2>
      <p className="text-lg/[1.6] text-charcoal">{shortDesc}</p>
    </section>
  );
}
