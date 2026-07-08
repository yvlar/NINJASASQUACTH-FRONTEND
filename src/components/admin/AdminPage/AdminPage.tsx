import AuthProvider from "../../../auth/AuthProvider";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import GamesManager from "../GamesManager";
import RequireAdmin from "../RequireAdmin";
import styles from "./AdminPage.module.css";

function AdminContent() {
  const { t } = useLanguage();
  const { session, signOut } = useAuth();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("admin.title")}</h1>
        {session && (
          <button className={styles.signOut} type="button" onClick={signOut}>
            {t("admin.signOut")}
          </button>
        )}
      </div>
      <RequireAdmin>
        <GamesManager />
      </RequireAdmin>
    </main>
  );
}

// AuthProvider vit ici (et pas dans AppRoutes) : la session n'est montée
// que sous /admin, le site vitrine ne fait aucun appel d'authentification.
export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
