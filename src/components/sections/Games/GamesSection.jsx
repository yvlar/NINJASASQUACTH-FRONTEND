import { useState } from "react";
import { games, categories } from "../../../data/games";
import { useLanguage } from "../../../i18n/useLanguage";
import GameCard from "./GameCard";
import GameDetail from "./GameDetail";
import CategoryFilter from "./CategoryFilters";
import styles from "./Games.module.css";

export default function GamesSection() {
  const [selectedCategory, setSelectedCategory] = useState("tous");
  const [selectedGame, setSelectedGame] = useState(null);
  const { t } = useLanguage();

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

        <div className={styles.grid}>
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setSelectedGame(game)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
