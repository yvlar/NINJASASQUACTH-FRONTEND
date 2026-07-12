import type { ReactNode } from "react";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import LoginForm from "../LoginForm";

// Garde d'accès UX : anonyme → login, non-admin → refus, admin → contenu.
// La sécurité réelle est portée par la RLS Supabase (écritures refusées
// sans rôle admin), jamais par cette garde.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { session, role, loading, signOut } = useAuth();

  if (loading) {
    return <p className="mx-auto max-w-[60rem]">{t("admin.loading")}</p>;
  }
  if (!session) {
    return <LoginForm />;
  }
  if (role === null) {
    // session présente, rôle en cours de lecture dans `profiles`
    return <p className="mx-auto max-w-[60rem]">{t("admin.loading")}</p>;
  }
  if (role !== "admin") {
    return (
      <div className="mx-auto flex max-w-[60rem] flex-col items-start gap-4">
        <p className="font-semibold text-error" role="alert">
          {t("admin.denied")}
        </p>
        <button
          className="cursor-pointer rounded-lg border border-charcoal bg-transparent px-[0.9rem] py-2 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          type="button"
          onClick={signOut}
        >
          {t("admin.signOut")}
        </button>
      </div>
    );
  }
  return children;
}
