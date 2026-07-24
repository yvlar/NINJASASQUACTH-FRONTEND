import { Leaf } from "lucide-react";
import BrandLogo from "../../brand/BrandLogo";
import { useLanguage } from "../../../i18n/useLanguage";
import SocialLinks from "../SocialLinks";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-charcoal py-10 text-center text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4">
        <BrandLogo inverted className="mb-3 max-h-16 max-w-[240px] text-lg/[1.6]" />
        <p className="mb-4 text-cream opacity-80">
          {t("footer.copyright")} {t("footer.rights")}
        </p>
        <SocialLinks
          className="mb-4 justify-center"
          linkClassName="text-cream hover:text-roux"
        />
        <p className="mt-2 flex items-center justify-center gap-2 text-cream">
          <Leaf size={16} aria-hidden />
          <span>{t("footer.tagline")}</span>
        </p>
      </div>
    </footer>
  );
}
