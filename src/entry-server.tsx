// Point d'entrée du rendu serveur (Sprint 11, Partie A). Rend l'application
// en chaîne HTML pour le PRÉ-RENDU au build — pas de réseau, pas de DOM.
// La langue est déduite de l'URL et fixée directement sur le provider (les
// effets ne s'exécutent pas au rendu serveur, donc /en doit être seedé en
// anglais). L'amorce de données rend le vrai contenu (H1, texte, liens).
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import LanguageProvider from "./i18n/LanguageProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./AppRoutes";
import { PrerenderContext, type PrerenderData } from "./ssr/prerenderContext";
import { langFromUrl } from "./i18n/langFromUrl";

// Ré-exporté pour l'entrée de pré-rendu (rétro-compat des imports du bundle).
export { langFromUrl };

const EMPTY_DATA: PrerenderData = { games: [], media: {} };

export function render(url: string, data: PrerenderData = EMPTY_DATA): string {
  const lang = langFromUrl(url);
  return renderToString(
    <StaticRouter location={url}>
      <LanguageProvider initialLang={lang}>
        <PrerenderContext.Provider value={data}>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </PrerenderContext.Provider>
      </LanguageProvider>
    </StaticRouter>,
  );
}
