import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import LanguageProvider from "./i18n/LanguageProvider";
import { langFromUrl } from "./i18n/langFromUrl";
import { PrerenderContext } from "./ssr/prerenderContext";
import { readPrerenderSeed } from "./ssr/serializeSeed";
// Base globale (Tailwind + palette) chargée ici : « / » ET /admin en héritent
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine #root introuvable dans index.html");
}

// Amorce de pré-rendu : lue AVANT le premier rendu pour que le client reçoive
// exactement les mêmes données que le serveur → hydratation sans divergence.
const seed = readPrerenderSeed();
// Langue initiale déduite de l'URL (jamais un flash FR sur /en).
const initialLang = langFromUrl(window.location.pathname);

const app = (
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider initialLang={initialLang}>
        <PrerenderContext.Provider value={seed}>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </PrerenderContext.Provider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);

// Le HTML pré-rendu contient déjà le balisage → on HYDRATE (on ne remplace
// pas). Sans balisage (shell client réellement vide, ex. /admin), on monte
// normalement.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
