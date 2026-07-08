// Routage de l'application : « / » = site vitrine (App, inchangé),
// « /admin » = espace d'administration chargé à la demande (le visiteur du
// site ne télécharge jamais le bundle admin), tout le reste revient au site.
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { useLanguage } from "./i18n/useLanguage";

const AdminPage = lazy(() => import("./components/admin/AdminPage"));

export default function AppRoutes() {
  const { t } = useLanguage();

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/admin"
        element={
          // Fallback visible pendant le téléchargement du bundle admin (D18)
          <Suspense fallback={<p role="status">{t("admin.loading")}</p>}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
