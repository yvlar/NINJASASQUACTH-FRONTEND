import React from "react";
import { Users, Clock, Leaf } from "lucide-react";
import styles from "./Games.module.css";

export default function GameCard({ game, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img src={game.image} alt={game.title} className={styles.image} />
        {game.eco && (
          <div className={styles.ecoBadge}>
            <Leaf size={20} color="#ffffe9" />
          </div>
        )}
      </div>
      <h3 className={styles.cardTitle}>{game.title}</h3>
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
  );
}
