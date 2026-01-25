import React from "react";
import { Leaf } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.brand}>
          <span className={styles.brandNinja}>Ninja </span>
          <span className={styles.brandSasquatch}>Sasquatch Games</span>
        </p>
        <p className={styles.copyright}>
          © 2026 Ninja Sasquatch Games. Tous droits réservés.
        </p>
        <p className={styles.tagline}>
          <Leaf size={16} />
          <span>Fièrement québécois et 100% compostable</span>
        </p>
      </div>
    </footer>
  );
}
