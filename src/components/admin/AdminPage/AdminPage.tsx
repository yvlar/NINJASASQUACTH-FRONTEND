import type { ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import AuthProvider from "../../../auth/AuthProvider";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { homePath } from "../../../utils/routes";
import GamesManager from "../GamesManager";
import RequireAdmin from "../RequireAdmin";

function AdminShell({
  children,
  canSignOut = false,
  onSignOut,
}: {
  children: ReactNode;
  canSignOut?: boolean;
  onSignOut?: () => void;
}) {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-roux/5 text-charcoal">
      <header className="border-b border-charcoal/10 bg-cream/95 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[72rem] flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="mb-1 font-brand text-sm tracking-[0.08em] text-forest">
              Ninja Sasquatch Games
            </p>
            <h1 className="text-3xl tracking-[-0.01em] text-roux md:text-4xl">
              {t("admin.title")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={homePath(lang)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-charcoal/25 bg-white px-4 py-2.5 font-semibold text-charcoal transition-colors duration-200 hover:border-roux hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              {t("nav.home")}
              <ExternalLink size={17} aria-hidden />
            </a>

            {canSignOut && onSignOut && (
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-charcoal/25 bg-transparent px-4 py-2.5 font-semibold text-charcoal transition-colors duration-200 hover:border-error hover:text-error motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                type="button"
                onClick={onSignOut}
              >
                <LogOut size={17} aria-hidden />
                {t("admin.signOut")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[72rem] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function AdminUnavailable() {
  const { t } = useLanguage();
  return (
    <AdminShell>
      <div className="rounded-xl border border-error/25 bg-white p-6 shadow-[0_8px_24px_-18px_rgba(43,36,32,0.35)]">
        <p className="font-semibold text-error" role="alert">
          {t("admin.notConfigured")}
        </p>
        <p className="mt-2 text-charcoal">{t("admin.notConfiguredHint")}</p>
      </div>
    </AdminShell>
  );
}

function AdminContent() {
  const { session, signOut } = useAuth();

  return (
    <AdminShell canSignOut={Boolean(session)} onSignOut={signOut}>
      <RequireAdmin>
        <GamesManager />
      </RequireAdmin>
    </AdminShell>
  );
}

// AuthProvider vit ici (et pas dans AppRoutes) : la session n'est montée
// que sous /admin, le site vitrine ne fait aucun appel d'authentification.
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
