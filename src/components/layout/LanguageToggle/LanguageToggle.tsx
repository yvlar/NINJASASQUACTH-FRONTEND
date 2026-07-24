// Bouton FR/EN : navigue vers la route équivalente dans l'autre langue en
// conservant le slug (la langue est portée par l'URL). Pilule bordée brune,
// identique à l'ancien bouton du Header.
import { useLocation, useNavigate } from "react-router";
import { useLanguage } from "../../../i18n/useLanguage";
import { otherLangPath } from "../../../utils/routes";

const langButtonBase =
  "cursor-pointer rounded-full border-2 border-roux px-3 py-1 font-bold text-roux transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const target = lang === "fr" ? "EN" : "FR";

  return (
    <button
      type="button"
      className={`${langButtonBase} ${className}`.trim()}
      aria-label={t("nav.switchLanguage")}
      onClick={() => navigate(otherLangPath(location.pathname, lang))}
    >
      {target}
    </button>
  );
}
