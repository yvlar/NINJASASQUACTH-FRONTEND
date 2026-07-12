import { Link } from "react-router-dom";
import { Users, Clock, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import { gamePath } from "../../../utils/routes";
import type { GameRow } from "../../../types/database";

// Carte du catalogue : un VRAI lien vers la fiche partageable du jeu
// (/fr/jeux/:slug ou /en/games/:slug) — nativement accessible au clavier,
// plus de div role="button". Un jeu sans slug (donnée héritée) reste affiché
// mais non cliquable.
export default function GameCard({ game }: { game: GameRow }) {
  const { lang, t } = useLanguage();
  const { title, shortDesc } = localizeGame(game, lang);

  const media = (
    <>
      <div className="relative mb-4 overflow-hidden rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        {game.image_url && (
          <img
            src={game.image_url}
            alt={title}
            className="h-64 w-full object-cover"
          />
        )}
        {game.eco && (
          <div className="absolute top-2 right-2 rounded-full bg-forest p-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <Leaf size={20} color="var(--color-cream)" />
          </div>
        )}
      </div>
      <h3 className="mb-2 text-xl/[1.6] font-bold text-roux">{title}</h3>
      <p className="mb-3 text-charcoal">{shortDesc}</p>
      <div className="flex gap-4 text-sm/[1.6] text-charcoal">
        <span className="flex items-center gap-1">
          <Users size={16} />
          {game.players}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {game.duration}
        </span>
      </div>
    </>
  );

  if (!game.slug) {
    return <div className="block">{media}</div>;
  }

  return (
    <Link
      to={gamePath(lang, game.slug)}
      aria-label={`${title} — ${t("games.viewGame")}`}
      className="block transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none focus-visible:rounded-lg focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-forest"
    >
      {media}
    </Link>
  );
}
