import type { ReactNode } from "react";
import AuthProvider from "../../../auth/AuthProvider";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import { isSupabaseConfigured } from "../../../lib/supabase";
import GamesManager from "../GamesManager";
import RequireAdmin from "../RequireAdmin";

// Coquille commune (h1 + contenu) réutilisée par l'admin et l'état « non
// configuré » — un seul gabarit, une seule largeur.
function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-charcoal md:px-8 md:py-12">
      <div className="mx-auto mb-6 flex max-w-[60rem] items-center justify-between gap-4">
        <h1 className="text-roux">{t("admin.title")}</h1>
      </div>
      {children}
    </main>
  );
}

// Garde de configuration CENTRALISÉE : sans VITE_SUPABASE_URL/ANON_KEY, on ne
// monte JAMAIS AuthProvider (seul déclencheur des appels Auth) ni aucun
// composant admin (GamesManager, GameForm, GameMediaManager n'apparaissent que
// derrière une session, impossible sans config). Résultat : zéro appel réseau
// (Auth, Storage, PostgREST), aucune erreur DNS, un message clair localisé —
// plutôt que de répéter le garde dans chaque composant.
function AdminUnavailable() {
  const { t } = useLanguage();
  return (
    <AdminShell>
      <p className="mx-auto max-w-[60rem] font-semibold text-error" role="alert">
        {t("admin.notConfigured")}
      </p>
      <p className="mx-auto mt-2 max-w-[60rem] text-charcoal">
        {t("admin.notConfiguredHint")}
      </p>
    </AdminShell>
  );
}

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
// Sans configuration Supabase, AuthProvider n'est pas monté du tout (voir
// AdminUnavailable) → aucun appel réseau depuis l'administration.
export default function AdminPage() {
  if (!isSupabaseConfigured) {
    return <AdminUnavailable />;
  }
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
