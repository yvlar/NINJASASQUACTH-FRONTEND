import React from "react";
import { Users, Clock, Star, Leaf } from "lucide-react";
import styles from "./Games.module.css";

export default function GameDetail({ game, onBack }) {
  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailContent}>
        <button onClick={onBack} className={styles.backButton}>
          ← Retour aux jeux
        </button>

        <div className={styles.detailGrid}>
          <div>
            <img
              src={game.image}
              alt={game.title}
              className={styles.detailImage}
            />
            {game.eco && (
              <div className={styles.ecoLabel}>
                <Leaf size={20} />
                <span>100% compostable et écoresponsable</span>
              </div>
            )}
          </div>

          <div>
            <h1 className={styles.detailTitle}>{game.title}</h1>

            <div className={styles.detailMeta}>
              <div className={styles.metaItem}>
                <Users size={20} />
                <span>{game.players} joueurs</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={20} />
                <span>{game.duration}</span>
              </div>
              <div className={styles.metaItem}>
                <Star size={20} />
                <span>{game.age}</span>
              </div>
            </div>

            <p className={styles.detailDesc}>{game.fullDesc}</p>

            <div className={styles.characteristics}>
              <h3 className={styles.characteristicsTitle}>Caractéristiques</h3>
              <ul className={styles.characteristicsList}>
                <li>
                  • Catégorie:{" "}
                  {game.category.charAt(0).toUpperCase() +
                    game.category.slice(1)}
                </li>
                <li>• Matériaux 100% compostables et écoresponsables</li>
                <li>• Conçu et fabriqué au Québec</li>
                <li>• Règles claires et accessibles à tous</li>
                <li>• Engagement environnemental garanti</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
