// Hero de l'accueil — met en vedette un jeu LU DEPUIS SUPABASE (Heroes Rising
// en priorité). Aucun contenu de jeu codé en dur ici : le jeu vedette est
// choisi parmi les jeux publiés (selectFeaturedGame). Si aucun jeu vedette
// n'est disponible (base vide, chargement, erreur), on retombe sur une
// composition de marque sobre — jamais de fausse boîte de jeu.
import { Link } from "react-router-dom";
import { ExternalLink, Bell, Leaf } from "lucide-react";
import { useSharedGames } from "../../../hooks/useSharedGames";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import { selectFeaturedGame, isEnglishOnly } from "../../../utils/featuredGame";
import { themeForKey } from "../../../data/gameThemes";
import { gamePath } from "../../../utils/routes";
import type { GameRow } from "../../../types/database";

// Fond de section : identité Ninja Sasquatch (crème → forêt très léger).
const SECTION_CLASS =
  "flex min-h-screen items-center bg-linear-135/srgb from-roux/10 to-forest/10 pt-16";

// Composition de marque sobre servant de visuel quand aucune image officielle
// n'existe — formes organiques + monogramme, PAS une maquette de boîte de jeu.
function BrandArtwork({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] bg-forest/90 shadow-[0_20px_40px_-15px_rgba(31,58,31,0.5)]"
    >
      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-roux/40 blur-2xl" />
      <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-cream/20 blur-2xl" />
      <span className="relative font-brand text-[5rem] leading-none text-cream md:text-[7rem]">
        {label}
      </span>
    </div>
  );
}

function FeaturedHero({
  game,
  onNavigate,
}: {
  game: GameRow;
  onNavigate: (id: string) => void;
}) {
  const { t, lang } = useLanguage();
  const { title } = localizeGame(game, lang);
  const tagline = lang === "en" ? game.tagline_en : game.tagline_fr;
  const theme = themeForKey(game.theme_key);
  const englishOnly = isEnglishOnly(game);
  // Mention Kickstarter uniquement si une campagne existe (statut ≠ none).
  const showCampaign = game.campaign_status !== "none";
  // Monogramme sobre pour le repli visuel (initiale du titre, sinon « NS »).
  const monogram = title.trim().charAt(0).toUpperCase() || "NS";

  return (
    <section id="accueil" className={SECTION_CLASS}>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr] items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[repeat(2,1fr)] lg:px-8">
        <div className="flex flex-col gap-5 text-left">
          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${theme.accentBadge}`}
          >
            {t("home.hero.featured")}
          </span>
          <h1 className="text-[2.75rem] tracking-[-0.01em] text-roux md:text-[4rem]">
            {title}
          </h1>
          {tagline && (
            <p className="max-w-xl text-xl/[1.6] text-charcoal">{tagline}</p>
          )}

          {showCampaign && (
            <p className="text-base/[1.6] font-semibold text-forest">
              {t(`games.detail.campaign.${game.campaign_status}`)}
            </p>
          )}

          {englishOnly && (
            <p className="w-fit rounded-md bg-charcoal/10 px-3 py-1 text-sm/[1.6] text-charcoal">
              {t("games.englishContent")}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => onNavigate("notify")}
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3.5 font-brand text-lg/[1.4] text-cream shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <Bell size={18} aria-hidden />
              {t("home.hero.notify")}
            </button>
            {game.slug && (
              <Link
                to={gamePath(lang, game.slug)}
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-3.5 font-brand text-lg/[1.4] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${theme.accentButton}`}
              >
                {t("home.hero.discoverGame")}
                <ExternalLink size={18} aria-hidden />
              </Link>
            )}
          </div>
        </div>

        <div>
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={title}
              className="aspect-square w-full rounded-[2rem] object-cover shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)]"
            />
          ) : (
            <BrandArtwork label={monogram} />
          )}
        </div>
      </div>
    </section>
  );
}

// Repli de marque sobre : présente le studio sans mettre en avant un jeu
// (base vide, chargement ou erreur de lecture). Reprend le copy validé.
function BrandHero({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { t } = useLanguage();

  return (
    <section id="accueil" className={SECTION_CLASS}>
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-left sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-sm font-semibold text-forest">
          <Leaf size={16} aria-hidden />
          {t("home.hero.brandKicker")}
        </span>
        <h1 className="mt-5 text-[2.75rem] tracking-[-0.02em] text-roux md:text-[4.25rem]">
          {t("home.hero.brandTitle")}
        </h1>
        <p className="mt-6 max-w-2xl text-xl/[1.6] text-charcoal md:text-2xl/[1.6]">
          {t("home.hero.brandLead")}
        </p>
        <button
          type="button"
          onClick={() => onNavigate("jeux")}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-forest px-8 py-4 font-brand text-lg/[1.4] text-cream shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {t("home.hero.discover")}
        </button>
      </div>
    </section>
  );
}

export default function Hero({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const { games, loading } = useSharedGames();
  const featured = loading ? null : selectFeaturedGame(games);

  return featured ? (
    <FeaturedHero game={featured} onNavigate={onNavigate} />
  ) : (
    <BrandHero onNavigate={onNavigate} />
  );
}
