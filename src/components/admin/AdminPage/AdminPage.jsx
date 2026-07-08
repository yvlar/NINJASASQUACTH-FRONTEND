import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./AdminPage.module.css";

export default function AdminPage() {
  const { t } = useLanguage();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{t("admin.title")}</h1>
    </main>
  );
}
