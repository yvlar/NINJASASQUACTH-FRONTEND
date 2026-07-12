// Routage localisé : la langue est portée par l'URL.
//   /          → redirection vers /fr
//   /fr, /en   → accueil localisé
//   /fr/jeux/:slug, /en/games/:slug → fiche jeu partageable
//   /admin     → espace d'administration (chargé à la demande)
//   *          → vraie page 404 (plus de redirection muette vers l'accueil)
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useLanguage } from "./i18n/useLanguage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import NotFoundPage from "./pages/NotFoundPage";

const AdminPage = lazy(() => import("./components/admin/AdminPage"));

export default function AppRoutes() {
  const { t } = useLanguage();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/fr" replace />} />
      <Route path="/fr" element={<HomePage lang="fr" />} />
      <Route path="/en" element={<HomePage lang="en" />} />
      <Route path="/fr/jeux/:slug" element={<GamePage lang="fr" />} />
      <Route path="/en/games/:slug" element={<GamePage lang="en" />} />
      <Route
        path="/admin"
        element={
          // Fallback visible pendant le téléchargement du bundle admin (D18)
          <Suspense fallback={<p role="status">{t("admin.loading")}</p>}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
