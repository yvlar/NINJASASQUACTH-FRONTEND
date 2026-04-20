import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";
import Logo from "../../common/Logo";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.header}>
      <div className={styles.container}>
        <Logo source="/public/Logo jeux/Logo-Site-Web Transparent.png" />

        <div className={styles.navDesktop}>
          <Link to="/" className={styles.navLink}>
            Accueil
          </Link>
          <Link to="/games" className={styles.navLink}>
            Nos Jeux
          </Link>
          <Link to="/about" className={styles.navLink}>
            Notre Univers
          </Link>
          <Link to="/contact" className={styles.navLink}>
            Contact
          </Link>
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
          <Link
            to="/"
            onClick={handleNavClick}
            className={styles.mobileNavLink}
          >
            Accueil
          </Link>
          <Link
            to="/games"
            onClick={handleNavClick}
            className={styles.mobileNavLink}
          >
            Nos Jeux
          </Link>
          <Link
            to="/about"
            onClick={handleNavClick}
            className={styles.mobileNavLink}
          >
            Notre Univers
          </Link>
          <Link
            to="/contact"
            onClick={handleNavClick}
            className={styles.mobileNavLink}
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}
