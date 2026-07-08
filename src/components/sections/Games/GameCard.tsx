import type { KeyboardEvent } from "react";
import { Users, Clock, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import type { GameRow } from "../../../types/database";

export default function GameCard({
  game,
  onClick,
}: {
  game: GameRow;
  onClick: () => void;
}) {
  const { lang } = useLanguage();
  // Contenu bilingue porté par le jeu lui-même (colonnes *_fr/*_en de la
  // base), résolu selon la langue courante — plus de clés games.items.*
  const { title, shortDesc } = localizeGame(game, lang);

  // Bouton non natif (la carte contient un h3, interdit dans un <button>) :
  // activation clavier Entrée/Espace pour rendre la vue détail atteignable
  // sans souris.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    // La carte est focalisable au clavier (role="button") : focus visible requis.
    <div
      className="cursor-pointer transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none focus-visible:rounded-lg focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-eco-green"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="relative mb-4 overflow-hidden rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        {game.image_url && (
          <img
            src={game.image_url}
            alt={title}
            className="h-64 w-full object-cover"
          />
        )}
        {game.eco && (
          <div className="absolute top-2 right-2 rounded-full bg-eco-green p-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <Leaf size={20} color="var(--color-cream)" />
          </div>
        )}
      </div>
      <h3 className="mb-2 text-xl/[1.6] font-bold text-brown">{title}</h3>
      <p className="mb-3 text-dark-green">{shortDesc}</p>
      <div className="flex gap-4 text-sm/[1.6] text-dark-green">
        <span className="flex items-center gap-1">
          <Users size={16} />
          {game.players}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {game.duration}
        </span>
      </div>
    </div>
  );
}
