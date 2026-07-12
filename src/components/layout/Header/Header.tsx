import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import LanguageToggle from "../LanguageToggle";

// Classes partagées par les liens de navigation (desktop et mobile) :
// mêmes couleur, graisse et transition d'opacité que l'ancien module.
const navLinkBase =
  "cursor-pointer font-medium text-charcoal transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function Header({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "accueil", label: t("nav.home") },
    { id: "jeux", label: t("nav.games") },
    { id: "univers", label: t("nav.universe") },
    { id: "contact", label: t("nav.contact") },
  ];

  return (
    // bg-cream/95 = rgba(255, 255, 233, 0.95), la crème de la palette à 95 %.
    <nav className="fixed top-0 left-0 right-0 z-[1000] w-full bg-cream/95 backdrop-blur-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4">
        <div className="select-none font-brand text-2xl font-extrabold tracking-[0.02em]">
          <span className="text-roux">Ninja </span>
          <span className="text-charcoal">Sasquatch</span>
        </div>

        <div className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={navLinkBase}
            >
              {item.label}
            </button>
          ))}
          <LanguageToggle />
        </div>

        <button
          className="flex cursor-pointer text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="flex flex-col gap-3 border-t border-roux bg-cream p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`${navLinkBase} py-3 text-left`}
            >
              {item.label}
            </button>
          ))}
          <LanguageToggle className="self-start" />
        </div>
      )}
    </nav>
  );
}
