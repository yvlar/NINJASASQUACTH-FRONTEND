import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Hero.module.css";

export default function Hero({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <section id="accueil" className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t("hero.title")}</h1>
          <h2 className={styles.subtitle}>{t("hero.subtitle")}</h2>
          <p className={styles.description}>{t("hero.description")}</p>
          <p className={styles.mission}>{t("hero.mission")}</p>
          <button className={styles.cta} onClick={() => onNavigate("jeux")}>
            {t("hero.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
