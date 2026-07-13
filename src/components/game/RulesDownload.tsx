// Téléchargement des règles (PDF) dans la langue courante. Le chemin vient de
// Supabase (rules_pdf_fr/en). Aucun lien mort : si le PDF n'existe pas (chemin
// vide), on affiche une mention traduite « bientôt disponible » au lieu d'un
// bouton. Le lien est un vrai <a> qui annonce clairement le format PDF.
import { FileText } from "lucide-react";
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function RulesDownload({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const href = lang === "en" ? game.rules_pdf_en : game.rules_pdf_fr;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">
        {t("games.detail.rules")}
      </h2>
      {href ? (
        <a
          href={href}
          type="application/pdf"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 font-semibold text-cream transition-opacity duration-300 hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        >
          <FileText size={18} />
          {t("games.detail.download")}
        </a>
      ) : (
        <p className="text-charcoal italic">
          {t("games.detail.rulesComingSoon")}
        </p>
      )}
    </section>
  );
}
