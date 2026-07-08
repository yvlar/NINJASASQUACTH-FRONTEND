import { Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.brand}>
          <span className={styles.brandNinja}>Ninja </span>
          <span className={styles.brandSasquatch}>Sasquatch Games</span>
        </p>
        <p className={styles.copyright}>
          {t("footer.copyright")} {t("footer.rights")}
        </p>
        <p className={styles.tagline}>
          <Leaf size={16} />
          <span>{t("footer.tagline")}</span>
        </p>
      </div>
    </footer>
  );
}
