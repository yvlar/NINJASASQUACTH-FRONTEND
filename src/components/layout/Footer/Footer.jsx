import React from "react";
import { Leaf } from "lucide-react";
import styles from "./Footer.module.css";
import Logo from "../../common/Logo/Logo.jsx";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* ✅ Logo en DIV (sortie du <p>) */}
        <div className={styles.logoWrapper}>
          <Logo source="public\Logo jeux\Ninja-Sasquatch-Footers-au long.png" />
        </div>

        {/* ✅ Copyright en P (texte seulement) */}
        <p className={styles.copyright}>
          © 2026 Ninja Sasquatch Games. Tous droits réservés.
        </p>

        {/* ✅ Tagline en P */}
        <p className={styles.tagline}>
          <Leaf size={16} />
          <span>Fièrement québécois et 100% compostable</span>
        </p>
      </div>
    </footer>
  );
}
