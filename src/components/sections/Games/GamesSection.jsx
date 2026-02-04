import React, { useState, useEffect } from "react";
import gamesData from "../../../data/game.json";
import GameCard from "./GameCard";
import GameDetail from "./GameDetail";
import CategoryFilter from "./CategoryFiltes";
import styles from "./Games.module.css";

export default function GamesSection() {
  const [selectedCategory, setSelectedCategory] = useState("tous");
  const [selectedGame, setSelectedGame] = useState(null);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = gamesData;

        setGames(data.games || []);
        setCategories(data.categories || []);
      } catch (err) {
        setError("Erreur lors du chargement des jeux");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames =
    selectedCategory === "tous"
      ? games
      : games.filter((game) =>
          Array.isArray(game.category)
            ? game.category.includes(selectedCategory)
            : game.category === selectedCategory,
        );

  if (selectedGame) {
    return (
      <GameDetail
        game={selectedGame}
        categories={categories}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  if (loading) {
    return (
      <section id="jeux" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>Chargement des jeux...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="jeux" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="jeux" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Nos Créations</h2>
        <p className={styles.description}>
          Chaque jeu est pensé avec passion pour offrir une expérience unique,
          amusante et respectueuse de l'environnement.
        </p>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className={styles.grid}>
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                categories={categories}
                onClick={() => setSelectedGame(game)}
              />
            ))
          ) : (
            <p className={styles.noGames}>
              Aucun jeu trouvé dans cette catégorie.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
