import React from "react";
import { Users, Clock, Leaf } from "lucide-react";
import styles from "./Games.module.css";
import CategoryTag from "./CategoryTag";

export default function GameCard({ game, categories, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img
          src={game.image}
          alt={game.title}
          className={styles.image}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x300?text=Image+non+disponible";
          }}
        />
        {game.eco && (
          <div className={styles.ecoBadge}>
            <Leaf size={20} color="#ffffe9" />
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{game.title}</h3>

        {game.category && game.category.length > 0 && (
          <CategoryTag styles={styles} game={game} categories={categories} />
        )}

        <p className={styles.cardDesc}>{game.shortDesc}</p>

        <div className={styles.cardInfo}>
          <span className={styles.infoItem}>
            <Users size={16} />
            {game.players}
          </span>
          <span className={styles.infoItem}>
            <Clock size={16} />
            {game.duration}
          </span>
        </div>
      </div>
    </div>
  );
}
