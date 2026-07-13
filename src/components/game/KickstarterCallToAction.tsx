// Appel à l'action Kickstarter : affiché seulement si une campagne existe
// (statut ≠ none) ET qu'une URL est fournie. Le libellé reflète le statut.
import { ExternalLink } from "lucide-react";
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function KickstarterCallToAction({ game }: { game: GameRow }) {
  const { t } = useLanguage();
  if (game.campaign_status === "none" || !game.kickstarter_url) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 rounded-lg border-l-4 border-l-forest bg-forest/10 p-6">
        <h2 className="text-2xl text-roux">
          {t("games.detail.kickstarter")}
        </h2>
        <p className="text-charcoal">
          {t(`games.detail.campaign.${game.campaign_status}`)}
        </p>
        <a
          href={game.kickstarter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 font-semibold text-cream transition-opacity duration-300 hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <ExternalLink size={18} />
          {t("games.detail.kickstarterCta")}
        </a>
      </div>
    </section>
  );
}
