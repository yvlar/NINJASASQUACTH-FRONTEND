import { useState } from "react";
import { categories } from "../../../data/games";
import { useGames } from "../../../hooks/useGames";
import { useLanguage } from "../../../i18n/useLanguage";
import GameCard from "./GameCard";
import GameDetail from "./GameDetail";
import CategoryFilter from "./CategoryFilters";
import styles from "./Games.module.css";
import type { CatalogCategoryId, GameRow } from "../../../types/database";

export default function GamesSection() {
  const [selectedCategory, setSelectedCategory] =
    useState<CatalogCategoryId>("tous");
  const [selectedGame, setSelectedGame] = useState<GameRow | null>(null);
  const { t } = useLanguage();
  // Les jeux viennent de Supabase (la RLS ne sert que les jeux publiés aux
  // visiteurs anonymes) ; la base peut être vide tant que l'admin n'a rien créé.
  const { games, loading, error } = useGames();

  const filteredGames =
    selectedCategory === "tous"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  if (selectedGame) {
    return (
      <GameDetail game={selectedGame} onBack={() => setSelectedGame(null)} />
    );
  }

  return (
    <section id="jeux" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("games.title")}</h2>
        <p className={styles.description}>{t("games.description")}</p>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading && <p className={styles.state}>{t("games.loading")}</p>}
        {!loading && error != null && (
          <p className={styles.stateError} role="alert">
            {t("games.error")}
          </p>
        )}
        {!loading && error == null && filteredGames.length === 0 && (
          <p className={styles.state}>{t("games.empty")}</p>
        )}
        {!loading && error == null && filteredGames.length > 0 && (
          <div className={styles.grid}>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
