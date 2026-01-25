import React from "react";
import styles from "./Hero.module.css";

export default function Hero({ onNavigate }) {
  return (
    <section id="accueil" className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Origines Mystérieuses</h1>
          <h2 className={styles.subtitle}>
            L'univers de Ninja Sasquatch Games
          </h2>
          <p className={styles.description}>
            Une jeune compagnie québécoise qui sort des sentiers battus pour
            vous offrir des jeux de société originaux, amusants et accessibles à
            tous.
          </p>
          <p className={styles.mission}>
            Ici, on allie créativité, rires, une touche de mystère, et des
            valeurs fortes pour l'environnement. Nos jeux sont conçus pour
            transformer vos soirées en moments mémorables, que ce soit en
            famille ou entre amis.
          </p>
          <button className={styles.cta} onClick={() => onNavigate("jeux")}>
            Découvrir nos jeux
          </button>
        </div>
      </div>
    </section>
  );
}
