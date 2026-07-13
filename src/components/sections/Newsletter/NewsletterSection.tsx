// Section notification de lancement (ancre #notify, cible du CTA « Être notifié
// au lancement » du hero). Capture courriel réelle via l'Edge Function
// (NewsletterForm) — jamais d'insertion Supabase publique. Le lien Kickstarter
// n'apparaît QUE si le jeu vedette expose une URL publique.
import { ExternalLink } from "lucide-react";
import { useGames } from "../../../hooks/useGames";
import { useLanguage } from "../../../i18n/useLanguage";
import { selectFeaturedGame } from "../../../utils/featuredGame";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  const { t } = useLanguage();
  const { games, loading } = useGames();
  const featured = loading ? null : selectFeaturedGame(games);
  const kickstarterUrl =
    featured &&
    featured.campaign_status !== "none" &&
    featured.kickstarter_url
      ? featured.kickstarter_url
      : null;

  return (
    <section id="notify" className="bg-brown/5 py-20">
      <div className="mx-auto max-w-3xl px-4 text-left sm:px-6 lg:px-8">
        <h2 className="mb-4 text-[2.25rem] tracking-[-0.01em] text-roux md:text-[2.75rem]">
          {t("newsletter.title")}
        </h2>
        <p className="mb-8 max-w-2xl text-lg/[1.6] text-charcoal">
          {t("newsletter.lead")}
        </p>

        <NewsletterForm source="notify-launch" />

        {kickstarterUrl && (
          <a
            href={kickstarterUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-roux px-6 py-3.5 font-brand text-lg/[1.4] text-roux transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            {t("games.detail.kickstarterCta")}
            <ExternalLink size={18} aria-hidden />
          </a>
        )}
      </div>
    </section>
  );
}
