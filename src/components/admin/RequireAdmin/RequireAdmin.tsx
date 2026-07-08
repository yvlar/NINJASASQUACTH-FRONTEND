import type { ReactNode } from "react";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import LoginForm from "../LoginForm";
import styles from "./RequireAdmin.module.css";

// Garde d'accès UX : anonyme → login, non-admin → refus, admin → contenu.
// La sécurité réelle est portée par la RLS Supabase (écritures refusées
// sans rôle admin), jamais par cette garde.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { session, role, loading, signOut } = useAuth();

  if (loading) {
    return <p className={styles.status}>{t("admin.loading")}</p>;
  }
  if (!session) {
    return <LoginForm />;
  }
  if (role === null) {
    // session présente, rôle en cours de lecture dans `profiles`
    return <p className={styles.status}>{t("admin.loading")}</p>;
  }
  if (role !== "admin") {
    return (
      <div className={styles.denied}>
        <p className={styles.deniedMessage} role="alert">
          {t("admin.denied")}
        </p>
        <button className={styles.signOut} type="button" onClick={signOut}>
          {t("admin.signOut")}
        </button>
      </div>
    );
  }
  return children;
}
