// Section notification de lancement (ancre #notify, cible du CTA « Être notifié
// au lancement » du hero). Sobre : sans backend d'infolettre, l'action renvoie
// vers le formulaire de contact. Le lien Kickstarter n'apparaît QUE si le jeu
// vedette expose une URL publique (jamais de lien Kickstarter sans URL).
import { ExternalLink, Bell } from "lucide-react";
import { useGames } from "../../../hooks/useGames";
import { useLanguage } from "../../../i18n/useLanguage";
import { selectFeaturedGame } from "../../../utils/featuredGame";

export default function NewsletterSection({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
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
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => onNavigate("contact")}
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3.5 font-brand text-lg/[1.4] text-cream shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <Bell size={18} aria-hidden />
            {t("home.hero.notify")}
          </button>
          {kickstarterUrl && (
            <a
              href={kickstarterUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-roux px-6 py-3.5 font-brand text-lg/[1.4] text-roux transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              {t("games.detail.kickstarterCta")}
              <ExternalLink size={18} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
