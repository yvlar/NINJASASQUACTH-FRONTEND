import { Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./About.module.css";

const STAT_KEYS = ["compostable", "quebec", "accessible", "fun"];

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="univers" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <h2 className={styles.title}>{t("about.title")}</h2>
            <p className={styles.paragraph}>{t("about.p1")}</p>
            <p className={styles.paragraph}>{t("about.p2")}</p>
            <p className={styles.paragraph}>{t("about.p3")}</p>

            <div className={styles.ecoCard}>
              <div className={styles.ecoHeader}>
                <Leaf size={28} color="var(--color-cream)" />
                <h3 className={styles.ecoTitle}>{t("about.ecoTitle")}</h3>
              </div>
              <p className={styles.ecoDesc}>{t("about.ecoDesc")}</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {STAT_KEYS.map((key) => (
              <div key={key} className={styles.statCard}>
                <div className={styles.statNumber}>
                  {t(`about.statValues.${key}`)}
                </div>
                <div className={styles.statLabel}>{t(`about.stats.${key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
