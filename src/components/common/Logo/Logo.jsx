import React from "react";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logo}>
      <img src="/NinjaLogoTranparency.png" alt="Ninja Sasquatch Games" />
      <div className={styles.logoText}>
        <span className={styles.ninja}>NINJA</span>
        <span className={styles.sasquatch}>SASQUATCH</span>
      </div>
    </div>
  );
}
