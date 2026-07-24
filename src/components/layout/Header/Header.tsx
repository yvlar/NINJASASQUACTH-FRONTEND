import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../../i18n/useLanguage";
import { homePath } from "../../../utils/routes";
import LanguageToggle from "../LanguageToggle";

// Classes partagées par les liens de navigation (desktop et mobile) : couleur
// de marque, virage vers le roux au survol (motion-reduce le neutralise) et
// anneau de focus visible.
const navLinkBase =
  "cursor-pointer font-medium text-charcoal transition-colors duration-300 hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function Header({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, lang } = useLanguage();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMenuOpen(false);
  };

  // Accessibilité du menu mobile : Échap ferme le menu et rend le focus au
  // bouton d'ouverture (pas de focus perdu dans le vide).
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const navItems = [
    { id: "accueil", label: t("nav.home") },
    { id: "jeux", label: t("nav.games") },
    { id: "univers", label: t("nav.universe") },
    { id: "contact", label: t("nav.contact") },
  ];

  return (
    // bg-cream/95 = rgba(251, 248, 233, 0.95), la crème de la palette à 95 %.
    // Le header reste dans l'identité Ninja Sasquatch (aucune sous-palette).
    <nav
      aria-label={t("nav.primary")}
      className="fixed top-0 left-0 right-0 z-[1000] w-full bg-cream/95 backdrop-blur-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4">
        {/* Pas de logo officiel fourni → repli textuel propre en police de
            marque, cliquable vers l'accueil localisé (/fr ou /en). */}
        <Link
          to={homePath(lang)}
          aria-label={t("nav.homeLink")}
          className="select-none font-brand text-2xl tracking-[0.02em] transition-transform duration-300 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <span className="text-roux">Ninja </span>
          <span className="text-charcoal">Sasquatch</span>
        </Link>

        <div className="hidden gap-8 md:flex md:items-center">
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
          ref={toggleRef}
          type="button"
          aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="flex cursor-pointer text-charcoal transition-transform duration-300 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <X size={24} aria-hidden />
          ) : (
            <Menu size={24} aria-hidden />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="flex flex-col gap-3 border-t border-roux bg-cream p-4 md:hidden"
        >
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
