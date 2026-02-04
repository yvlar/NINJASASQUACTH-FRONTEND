import React from "react";
import { Users, Clock, Star, Leaf } from "lucide-react";
import styles from "./Games.module.css";

export default function GameDetail({ game, onBack }) {
  // Formater le texte avec les sauts de ligne
  const formatDescription = (text) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

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
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=Image+non+disponible";
              }}
            />
            {game.eco && (
              <div className={styles.ecoLabel}>
                <Leaf size={20} />
                <span>100% compostable et écoresponsable</span>
              </div>
            )}
          </div>

          <div>
            {/* ✅ Logo centré */}
            <div className={styles.logoContainer}>
              <img
                src={game.logo}
                alt={`${game.title} Logo`}
                className={styles.logoDetail}
              />
            </div>

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

            <div className={styles.detailDesc}>
              {formatDescription(game.fullDesc)}
            </div>

            {/* Description formatée avec sauts de ligne */}
            <div className={styles.detailDesc}>
              {formatDescription(game.fullDesc)}
            </div>

            <div className={styles.characteristics}>
              <h3 className={styles.characteristicsTitle}>Caractéristiques</h3>
              <ul className={styles.characteristicsList}>
                {/* Affichage des catégories (tableau) */}
                <li>
                  • Catégorie{game.category.length > 1 ? "s" : ""}:{" "}
                  {game.category
                    .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1))
                    .join(", ")}
                </li>
                <li>• Complexité: {game.complexity}</li>
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
