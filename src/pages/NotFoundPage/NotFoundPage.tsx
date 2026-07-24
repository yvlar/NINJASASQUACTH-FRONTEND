// Vraie page 404 : les chemins inconnus n'atterrissent plus sur l'accueil.
import { Link } from "react-router";
import { useLanguage } from "../../i18n/useLanguage";
import { homePath } from "../../utils/routes";
import PageMeta from "../../components/seo/PageMeta";

export default function NotFoundPage() {
  const { t, lang } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <PageMeta input={{ kind: "notFound", lang }} />
      <p className="text-[4rem] font-extrabold leading-none text-roux">404</p>
      <h1 className="text-2xl text-charcoal">
        {t("notFound.title")}
      </h1>
      <p className="max-w-md text-charcoal">{t("notFound.message")}</p>
      <Link
        to={homePath(lang)}
        className="rounded-lg bg-forest px-4 py-2.5 font-semibold text-cream transition-opacity duration-300 hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
      >
        {t("notFound.home")}
      </Link>
    </main>
  );
}
