import { Users, Clock, Star, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import styles from "./Games.module.css";
import type { GameRow } from "../../../types/database";

export default function GameDetail({
  game,
  onBack,
}: {
  game: GameRow;
  onBack: () => void;
}) {
  const { t, lang } = useLanguage();
  const { title, fullDesc } = localizeGame(game, lang);

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailContent}>
        <button onClick={onBack} className={styles.backButton}>
          ← {t("games.backToGames")}
        </button>

        <div className={styles.detailGrid}>
          <div>
            {game.image_url && (
              <img
                src={game.image_url}
                alt={title}
                className={styles.detailImage}
              />
            )}
            {game.eco && (
              <div className={styles.ecoLabel}>
                <Leaf size={20} />
                <span>{t("games.eco")}</span>
              </div>
            )}
          </div>

          <div>
            {/* h2 (pas h1) : le h1 unique de la page est celui du hero (D9) */}
            <h2 className={styles.detailTitle}>{title}</h2>

            <div className={styles.detailMeta}>
              <div className={styles.metaItem}>
                <Users size={20} />
                <span>
                  {game.players} {t("games.players")}
                </span>
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

            <p className={styles.detailDesc}>{fullDesc}</p>

            <div className={styles.characteristics}>
              <h3 className={styles.characteristicsTitle}>
                {t("games.characteristics")}
              </h3>
              <ul className={styles.characteristicsList}>
                <li>
                  • {t("games.category")}:{" "}
                  {t(`games.categories.${game.category}`)}
                </li>
                <li>• {t("games.materials")}</li>
                <li>• {t("games.madeIn")}</li>
                <li>• {t("games.rules")}</li>
                <li>• {t("games.commitment")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
