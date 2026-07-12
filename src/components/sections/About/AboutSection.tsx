import { Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";

const STAT_KEYS = ["compostable", "quebec", "accessible", "fun"] as const;

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    // bg-roux/5 = rgba(155, 88, 36, 0.05), le brun de la palette à 5 %.
    <section id="univers" className="bg-roux/5 py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Pistes 1fr arbitraires : grid-cols-1/2 (minmax(0,1fr)) répartiraient
            les colonnes différemment que l'ancien module (1fr ≙ minmax(auto,1fr)). */}
        <div className="grid grid-cols-[1fr] items-center gap-12 md:grid-cols-[repeat(2,1fr)]">
          <div>
            {/* « Origines Mystérieuses » / « L'univers de Ninja Sasquatch
                Games » : l'ancien copy du hero, réutilisé ici comme intro de
                la section univers (il n'est plus le hero principal). */}
            <p className="mb-2 font-brand text-sm tracking-[0.08em] text-forest">
              {t("hero.subtitle")}
            </p>
            <h2 className="mb-6 text-[2.5rem] tracking-[-0.01em] text-roux md:text-[3rem]">
              {t("about.title")}
            </h2>
            <p className="mb-4 text-lg/[1.6] text-charcoal">
              {t("about.p1")}
            </p>
            <p className="mb-4 text-lg/[1.6] text-charcoal">
              {t("about.p2")}
            </p>
            <p className="mb-4 text-lg/[1.6] text-charcoal">
              {t("about.p3")}
            </p>

            <div className="mt-8 rounded-lg bg-forest p-6">
              <div className="mb-3 flex items-center gap-3">
                <Leaf size={28} color="var(--color-cream)" />
                <h3 className="text-xl/[1.6] font-bold text-white">
                  {t("about.ecoTitle")}
                </h3>
              </div>
              <p className="text-cream">{t("about.ecoDesc")}</p>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(2,1fr)] gap-6">
            {/* Alternance brun / vert éco reprise des :nth-child du module :
                cartes impaires en brun, paires en vert. */}
            {STAT_KEYS.map((key, i) => (
              <div
                key={key}
                className={`rounded-lg border-t-4 bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] ${
                  i % 2 === 0 ? "border-t-roux" : "border-t-forest"
                }`}
              >
                <div
                  className={`mb-2 font-brand text-4xl/[1.6] font-extrabold ${
                    i % 2 === 0 ? "text-roux" : "text-forest"
                  }`}
                >
                  {t(`about.statValues.${key}`)}
                </div>
                <div className="text-charcoal">{t(`about.stats.${key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
