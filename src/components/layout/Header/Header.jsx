import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";
import Logo from "../../common/Logo";

export default function Header({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    onNavigate(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.header}>
      <div className={styles.container}>
        <Logo source="/public/Logo jeux/Logo-Site-Web Transparent.png" />

        <div className={styles.navDesktop}>
          <button
            onClick={() => handleNavClick("accueil")}
            className={styles.navLink}
          >
            Accueil
          </button>
          <button
            onClick={() => handleNavClick("jeux")}
            className={styles.navLink}
          >
            Nos Jeux
          </button>
          <button
            onClick={() => handleNavClick("univers")}
            className={styles.navLink}
          >
            Notre Univers
          </button>
          <button
            onClick={() => handleNavClick("contact")}
            className={styles.navLink}
          >
            Contact
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
          <button
            onClick={() => handleNavClick("accueil")}
            className={styles.mobileNavLink}
          >
            Accueil
          </button>
          <button
            onClick={() => handleNavClick("jeux")}
            className={styles.mobileNavLink}
          >
            Nos Jeux
          </button>
          <button
            onClick={() => handleNavClick("univers")}
            className={styles.mobileNavLink}
          >
            Notre Univers
          </button>
          <button
            onClick={() => handleNavClick("contact")}
            className={styles.mobileNavLink}
          >
            Contact
          </button>
        </div>
      )}
    </nav>
  );
}
