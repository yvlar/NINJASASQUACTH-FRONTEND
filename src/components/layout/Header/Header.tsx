import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Header.module.css";

export default function Header({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, t, toggleLang } = useLanguage();

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

  const targetLang = lang === "fr" ? "EN" : "FR";

  return (
    <nav className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoNinja}>Ninja </span>
          <span className={styles.logoSasquatch}>Sasquatch</span>
        </div>

        <div className={styles.navDesktop}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={styles.navLink}
            >
              {item.label}
            </button>
          ))}
          <button onClick={toggleLang} className={styles.langButton}>
            {targetLang}
          </button>
        </div>

        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={styles.mobileNavLink}
            >
              {item.label}
            </button>
          ))}
          <button onClick={toggleLang} className={styles.langButton}>
            {targetLang}
          </button>
        </div>
      )}
    </nav>
  );
}
