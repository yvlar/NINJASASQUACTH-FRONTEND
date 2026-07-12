// En-tête de fiche : image, titre (h1), accroche, catégorie, badge « à venir »,
// badge « contenu en anglais ». Reçoit la donnée Supabase — aucun contenu de
// jeu codé en dur. La sous-palette du jeu (theme_key) ne sert QUE d'accent
// local (barre au-dessus de l'image, pastille de catégorie). Le texte n'est
// jamais posé directement sur la photo (colonnes séparées).
import { useLanguage } from "../../i18n/useLanguage";
import { localizeGame } from "../../utils/localizeGame";
import { isEnglishOnly } from "../../utils/featuredGame";
import { themeForKey } from "../../data/gameThemes";
import type { GameRow } from "../../types/database";

export default function GameHero({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const { title } = localizeGame(game, lang);
  const tagline = lang === "en" ? game.tagline_en : game.tagline_fr;
  const theme = themeForKey(game.theme_key);
  const englishOnly = isEnglishOnly(game);

  return (
    <header className="mx-auto grid max-w-6xl grid-cols-[1fr] gap-8 px-4 py-8 md:grid-cols-[repeat(2,1fr)]">
      <div>
        {game.image_url && (
          <img
            src={game.image_url}
            alt={title}
            className={`h-96 w-full rounded-lg border-t-4 object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] ${theme.accentBar}`}
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${theme.accentBadge}`}
          >
            {t(`games.categories.${game.category}`)}
          </span>
          {game.coming_soon && (
            <span className="rounded-full bg-forest px-3 py-1 text-sm font-semibold text-cream">
              {t("games.detail.comingSoon")}
            </span>
          )}
          {englishOnly && (
            <span className="rounded-full bg-charcoal/10 px-3 py-1 text-sm font-semibold text-charcoal">
              {t("games.englishContent")}
            </span>
          )}
        </div>
        <h1 className="text-4xl/[1.2] tracking-[-0.01em] text-roux">{title}</h1>
        {tagline && (
          <p className="text-xl/[1.5] font-medium text-charcoal">{tagline}</p>
        )}
      </div>
    </header>
  );
}
