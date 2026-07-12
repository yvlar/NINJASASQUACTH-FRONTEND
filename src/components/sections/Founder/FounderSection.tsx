// Section « Derrière le studio ». La structure existe, mais AUCUNE biographie
// ni photo n'est inventée : ni la spec produit (absente, D21) ni Supabase ne
// fournit de contenu fondateur validé. On n'affiche donc que du contenu
// vérifié — le studio indépendant québécois (déjà validé dans « à propos ») et
// ses canaux publics réels — et la photo reste proprement absente (aucun
// <img> placeholder). Le vrai portrait/biographie reste une action utilisateur.
import { useLanguage } from "../../../i18n/useLanguage";
import SocialLinks from "../../layout/SocialLinks";

export default function FounderSection() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="founder-title" className="bg-cream py-20">
      <div className="mx-auto max-w-3xl px-4 text-left sm:px-6 lg:px-8">
        <h2
          id="founder-title"
          className="mb-6 text-[2.25rem] tracking-[-0.01em] text-roux md:text-[2.75rem]"
        >
          {t("founder.title")}
        </h2>
        <p className="mb-4 text-lg/[1.6] text-charcoal">{t("founder.lead")}</p>
        <p className="mb-8 text-lg/[1.6] text-charcoal">{t("founder.follow")}</p>
        <SocialLinks linkClassName="text-charcoal hover:text-roux" />
      </div>
    </section>
  );
}
