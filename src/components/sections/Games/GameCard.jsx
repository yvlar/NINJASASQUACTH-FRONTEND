import { Users, Clock, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Games.module.css";

export default function GameCard({ game, onClick }) {
  const { t } = useLanguage();

  // Bouton non natif (la carte contient un h3, interdit dans un <button>) :
  // activation clavier Entrée/Espace pour rendre la vue détail atteignable
  // sans souris.
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageContainer}>
        <img
          src={game.image}
          alt={t(`games.items.${game.id}.title`)}
          className={styles.image}
        />
        {game.eco && (
          <div className={styles.ecoBadge}>
            <Leaf size={20} color="var(--color-cream)" />
          </div>
        )}
      </div>
      <h3 className={styles.cardTitle}>{t(`games.items.${game.id}.title`)}</h3>
      <p className={styles.cardDesc}>{t(`games.items.${game.id}.shortDesc`)}</p>
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
