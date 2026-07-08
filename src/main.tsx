import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import LanguageProvider from "./i18n/LanguageProvider";
// Base globale (Tailwind + palette) chargée ici : « / » ET /admin en héritent
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine #root introuvable dans index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
