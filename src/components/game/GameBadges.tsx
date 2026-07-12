// Badges de gameplay : joueurs, durée, âge, complexité, éco. Rend les
// colonnes texte dérivées (players/duration/age) qui restent lisibles même
// pour une donnée héritée sans champs structurés.
import type { ReactNode } from "react";
import { Users, Clock, Star, Gauge, Leaf } from "lucide-react";
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

interface Badge {
  icon: ReactNode;
  label: string;
}

export default function GameBadges({ game }: { game: GameRow }) {
  const { t } = useLanguage();

  const badges: Badge[] = [];
  if (game.players)
    badges.push({
      icon: <Users size={18} />,
      label: `${game.players} ${t("games.players")}`,
    });
  if (game.duration)
    badges.push({ icon: <Clock size={18} />, label: game.duration });
  if (game.age) badges.push({ icon: <Star size={18} />, label: game.age });
  if (game.complexity)
    badges.push({ icon: <Gauge size={18} />, label: game.complexity });
  if (game.eco)
    badges.push({ icon: <Leaf size={18} />, label: t("games.eco") });

  if (badges.length === 0) return null;

  return (
    <ul className="mx-auto flex max-w-6xl list-none flex-wrap gap-4 px-4">
      {badges.map((badge) => (
        <li
          key={badge.label}
          className="flex items-center gap-2 rounded-lg bg-roux/10 px-4 py-2 text-charcoal"
        >
          {badge.icon}
          <span>{badge.label}</span>
        </li>
      ))}
    </ul>
  );
}
