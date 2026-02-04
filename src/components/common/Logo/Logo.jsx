import React from "react";
import styles from "./Logo.module.css";

export default function Logo({ source }) {
  return (
    <div className={styles.logo}>
      <img src={source} alt="Ninja Sasquatch Games" />
    </div>
  );
}
