// Repli affiché par ErrorBoundary — composant fonction séparé de la classe
// (règle react-refresh/only-export-components) pour lire la langue courante
// via useLanguage.
import { useLanguage } from "../../i18n/useLanguage";

export default function ErrorFallback() {
  const { t } = useLanguage();
  return (
    <div role="alert">
      <p>{t("errors.boundary.title")}</p>
      <button type="button" onClick={() => window.location.reload()}>
        {t("errors.boundary.reload")}
      </button>
    </div>
  );
}
