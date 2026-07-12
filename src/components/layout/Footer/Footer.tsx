import { Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-charcoal py-8 text-center text-white">
      <div className="mx-auto max-w-[1280px] px-4">
        <p className="mb-2 font-brand text-lg/[1.6] font-bold text-white">
          <span className="text-roux">Ninja </span>
          <span className="text-cream">Sasquatch Games</span>
        </p>
        <p className="mb-2 text-cream opacity-80">
          {t("footer.copyright")} {t("footer.rights")}
        </p>
        <p className="mt-2 flex items-center justify-center gap-2 text-forest">
          <Leaf size={16} />
          <span>{t("footer.tagline")}</span>
        </p>
      </div>
    </footer>
  );
}
