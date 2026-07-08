import { Users, Clock, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import styles from "./Games.module.css";

export default function GameCard({ game, onClick }) {
  const { lang } = useLanguage();
  // Contenu bilingue porté par le jeu lui-même (colonnes *_fr/*_en de la
  // base), résolu selon la langue courante — plus de clés games.items.*
  const { title, shortDesc } = localizeGame(game, lang);

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
        {game.image_url && (
          <img src={game.image_url} alt={title} className={styles.image} />
        )}
        {game.eco && (
          <div className={styles.ecoBadge}>
            <Leaf size={20} color="var(--color-cream)" />
          </div>
        )}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{shortDesc}</p>
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
