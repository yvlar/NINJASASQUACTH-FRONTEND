// Jeux similaires : autres jeux de la même catégorie (le jeu courant exclu),
// réutilise les cartes-liens du catalogue. Masqué si aucun voisin.
import { useLanguage } from "../../i18n/useLanguage";
import GameCard from "../sections/Games/GameCard";
import type { GameRow } from "../../types/database";

export default function RelatedGames({
  current,
  games,
}: {
  current: GameRow;
  games: GameRow[];
}) {
  const { t } = useLanguage();
  const related = games.filter(
    (game) => game.id !== current.id && game.category === current.category,
  );
  if (related.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-brown">
        {t("games.detail.related")}
      </h2>
      <div className="grid grid-cols-[1fr] gap-8 sm:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)]">
        {related.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
