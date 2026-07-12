import { useLanguage } from "../../../i18n/useLanguage";

export default function Hero({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const { t } = useLanguage();

  return (
    // Dégradé 135deg brun→vert éco à 10 % : tokens de palette avec le
    // modificateur d'opacité, interpolation srgb comme l'ancien module.
    <section
      id="accueil"
      className="flex min-h-screen items-center bg-linear-135/srgb from-roux/10 to-forest/10 pt-16"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Tailles arbitraires (text-[3rem]…) pour conserver la hauteur de
              ligne héritée 1.6, que les tailles nommées écraseraient. */}
          <h1 className="mb-6 text-[3rem] font-extrabold tracking-[-0.02em] text-roux md:text-[5rem]">
            {t("hero.title")}
          </h1>
          <h2 className="mb-8 text-[1.875rem] font-semibold text-charcoal md:text-[2.5rem]">
            {t("hero.subtitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl/[1.6] text-charcoal md:text-2xl/[1.6]">
            {t("hero.description")}
          </p>
          <p className="mx-auto mb-12 max-w-3xl text-base/[1.6] text-charcoal md:text-xl/[1.6]">
            {t("hero.mission")}
          </p>
          <button
            className="cursor-pointer rounded-lg bg-forest px-8 py-4 font-brand text-lg/[1.6] font-bold tracking-[0.02em] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition-opacity duration-300 hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            onClick={() => onNavigate("jeux")}
          >
            {t("hero.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
