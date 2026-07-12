import { Link } from "react-router-dom";
import { Users, Clock, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import { gamePath } from "../../../utils/routes";
import { themeForKey } from "../../../data/gameThemes";
import type { GameRow } from "../../../types/database";

// Carte du catalogue : un VRAI lien vers la fiche partageable du jeu
// (/fr/jeux/:slug ou /en/games/:slug) — nativement accessible au clavier,
// plus de div role="button". Un jeu sans slug (donnée héritée) reste affiché
// mais non cliquable. Le style diffère par theme_key (barre d'accent + halo au
// survol issus de gameThemes) mais la STRUCTURE reste identique d'un jeu à
// l'autre — pas de déséquilibre de profondeur.
export default function GameCard({ game }: { game: GameRow }) {
  const { lang, t } = useLanguage();
  const { title, shortDesc } = localizeGame(game, lang);
  const theme = themeForKey(game.theme_key);
  const monogram = title.trim().charAt(0).toUpperCase() || "NS";

  const card = (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-xl border-t-4 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow duration-300 motion-reduce:transition-none ${theme.accentBar} ${theme.cardRing}`}
    >
      <div className="relative">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={title}
            className="h-56 w-full object-cover"
          />
        ) : (
          // Pas d'image : bandeau de marque sobre (jamais de fausse boîte).
          <div
            aria-hidden
            className="flex h-56 w-full items-center justify-center bg-forest/90"
          >
            <span className="font-brand text-6xl text-cream">{monogram}</span>
          </div>
        )}
        {game.eco && (
          <div className="absolute top-2 right-2 rounded-full bg-forest p-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <Leaf size={20} color="var(--color-cream)" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-xl/[1.4] text-roux">{title}</h3>
        <p className="mb-4 flex-1 text-charcoal">{shortDesc}</p>
        <div className="flex gap-4 text-sm/[1.6] text-charcoal">
          <span className="flex items-center gap-1">
            <Users size={16} aria-hidden />
            {game.players}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} aria-hidden />
            {game.duration}
          </span>
        </div>
      </div>
    </article>
  );

  if (!game.slug) {
    return <div className="block h-full">{card}</div>;
  }

  return (
    <Link
      to={gamePath(lang, game.slug)}
      aria-label={`${title} — ${t("games.viewGame")}`}
      className="block h-full rounded-xl transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-forest"
    >
      {card}
    </Link>
  );
}
