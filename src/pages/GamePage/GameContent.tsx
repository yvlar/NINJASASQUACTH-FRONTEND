// Contenu de la fiche jeu. Remonté par slug (clé de route) → l'état de
// chargement se réinitialise proprement à chaque navigation. Les sections
// reçoivent la donnée Supabase — aucun jeu (Heroes Rising, Burgle Jack…)
// n'est codé en dur ici.
import { Link } from "react-router-dom";
import { useGames } from "../../hooks/useGames";
import { useGameBySlug } from "../../hooks/useGameBySlug";
import { useLanguage } from "../../i18n/useLanguage";
import { homePath } from "../../utils/routes";
import LanguageToggle from "../../components/layout/LanguageToggle";
import Footer from "../../components/layout/Footer";
import NotFoundPage from "../NotFoundPage";
import PageMeta from "../../components/seo/PageMeta";
import GameHero from "../../components/game/GameHero";
import GameBadges from "../../components/game/GameBadges";
import NarrativeSummary from "../../components/game/NarrativeSummary";
import HowToPlay from "../../components/game/HowToPlay";
import GameGallery from "../../components/game/GameGallery";
import RulesDownload from "../../components/game/RulesDownload";
import KickstarterCallToAction from "../../components/game/KickstarterCallToAction";
import FullRulesAccordion from "../../components/game/FullRulesAccordion";
import GameCredits from "../../components/game/GameCredits";
import RelatedGames from "../../components/game/RelatedGames";

function TopBar() {
  const { lang } = useLanguage();
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] w-full bg-cream/95 shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-[10px]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4">
        <Link to={homePath(lang)} className="select-none font-brand text-2xl tracking-[0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
          <span className="text-roux">Ninja </span>
          <span className="text-charcoal">Sasquatch</span>
        </Link>
        <LanguageToggle />
      </div>
    </nav>
  );
}

export default function GameContent({ slug }: { slug: string }) {
  const { t, lang } = useLanguage();
  const { game, media, loading, gameError, mediaError, notFound } =
    useGameBySlug(slug);
  // Jeux voisins pour RelatedGames (RLS : publiés seuls pour l'anonyme).
  const { games } = useGames();

  if (notFound) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-cream">
      <TopBar />
      <main className="pt-16">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link
            to={homePath(lang)}
            className="font-medium text-charcoal transition-opacity duration-300 hover:opacity-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            ← {t("games.backToGames")}
          </Link>
        </div>

        {loading && (
          <p role="status" className="my-16 text-center text-charcoal">
            {t("games.loading")}
          </p>
        )}
        {!loading && gameError != null && (
          <p role="alert" className="my-16 text-center font-semibold text-error">
            {t("games.error")}
          </p>
        )}
        {!loading && gameError == null && game && (
          <>
            <PageMeta input={{ kind: "game", lang, game }} />
            <GameHero game={game} />
            <GameBadges game={game} />
            <NarrativeSummary game={game} />
            <HowToPlay game={game} />
            <GameGallery media={media} hasError={mediaError != null} />
            <RulesDownload game={game} />
            <KickstarterCallToAction game={game} />
            <FullRulesAccordion game={game} />
            <GameCredits game={game} />
            <RelatedGames current={game} games={games} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
