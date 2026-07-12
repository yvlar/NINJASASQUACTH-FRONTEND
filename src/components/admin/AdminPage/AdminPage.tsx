import AuthProvider from "../../../auth/AuthProvider";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import GamesManager from "../GamesManager";
import RequireAdmin from "../RequireAdmin";

function AdminContent() {
  const { t } = useLanguage();
  const { session, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-charcoal md:px-8 md:py-12">
      <div className="mx-auto mb-6 flex max-w-[60rem] items-center justify-between gap-4">
        <h1 className="text-roux">{t("admin.title")}</h1>
        {session && (
          <button
            className="cursor-pointer rounded-lg border border-charcoal bg-transparent px-[0.9rem] py-2 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            type="button"
            onClick={signOut}
          >
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
