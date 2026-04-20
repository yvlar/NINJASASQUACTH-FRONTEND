import React from "react";
import { Leaf } from "lucide-react";
import styles from "./About.module.css";

export default function AboutSection() {
  return (
    <section id="univers" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <h2 className={styles.title}>Notre Mission</h2>
            <p className={styles.paragraph}>
              Ninja Sasquatch Games est née de la passion de créer des moments
              inoubliables autour de la table. Nous croyons fermement que les
              jeux de société ont le pouvoir de rassembler les gens et de créer
              des souvenirs durables.
            </p>
            <p className={styles.paragraph}>
              Notre engagement environnemental n'est pas qu'une promesse : tous
              nos jeux sont fabriqués avec des matériaux 100% compostables.
              Parce que s'amuser ne devrait jamais se faire au détriment de
              notre planète.
            </p>
            <p className={styles.paragraph}>
              Basés au Québec, nous puisons notre inspiration dans les légendes
              locales, la nature mystérieuse et l'esprit d'aventure qui
              caractérise notre belle province.
            </p>

            <div className={styles.ecoCard}>
              <div className={styles.ecoHeader}>
                <Leaf size={28} color="#ffffe9" />
                <h3 className={styles.ecoTitle}>Engagement Écoresponsable</h3>
              </div>
              <p className={styles.ecoDesc}>
                Chaque jeu Ninja Sasquatch est conçu dans le respect de
                l'environnement, avec des matériaux compostables et une
                production responsable.
              </p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div
              className={styles.statCard}
              style={{ borderTopColor: "#9b5824" }}
            >
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Compostable</div>
            </div>
            <div
              className={styles.statCard}
              style={{ borderTopColor: "#077e16" }}
            >
              <div className={styles.statNumber}>QUÉBEC</div>
              <div className={styles.statLabel}>Fait au Québec</div>
            </div>
            <div
              className={styles.statCard}
              style={{ borderTopColor: "#9b5824" }}
            >
              <div className={styles.statNumber}>TOUS</div>
              <div className={styles.statLabel}>Accessible à tous</div>
            </div>
            <div
              className={styles.statCard}
              style={{ borderTopColor: "#077e16" }}
            >
              <div className={styles.statNumber}>FUN</div>
              <div className={styles.statLabel}>Rires garantis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
