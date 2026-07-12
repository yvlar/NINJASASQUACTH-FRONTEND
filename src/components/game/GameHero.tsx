// En-tête de fiche : image, titre (h1), accroche, catégorie, badge « à venir ».
// Reçoit la donnée Supabase — aucun contenu de jeu codé en dur.
import { useLanguage } from "../../i18n/useLanguage";
import { localizeGame } from "../../utils/localizeGame";
import type { GameRow } from "../../types/database";

export default function GameHero({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const { title } = localizeGame(game, lang);
  const tagline = lang === "en" ? game.tagline_en : game.tagline_fr;

  return (
    <header className="mx-auto grid max-w-6xl grid-cols-[1fr] gap-8 px-4 py-8 md:grid-cols-[repeat(2,1fr)]">
      <div>
        {game.image_url && (
          <img
            src={game.image_url}
            alt={title}
            className="h-96 w-full rounded-lg object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brown/15 px-3 py-1 text-sm font-semibold text-brown">
            {t(`games.categories.${game.category}`)}
          </span>
          {game.coming_soon && (
            <span className="rounded-full bg-eco-green px-3 py-1 text-sm font-semibold text-cream">
              {t("games.detail.comingSoon")}
            </span>
          )}
        </div>
        <h1 className="text-4xl/[1.6] font-extrabold tracking-[-0.01em] text-brown">
          {title}
        </h1>
        {tagline && (
          <p className="text-xl/[1.5] font-medium text-dark-green">{tagline}</p>
        )}
      </div>
    </header>
  );
}
