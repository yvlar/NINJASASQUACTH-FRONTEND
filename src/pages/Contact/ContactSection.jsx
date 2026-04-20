import React from "react";
import { Mail, Youtube, Facebook, MessageCircle, Bell } from "lucide-react";
import styles from "./Contact.module.css";

export default function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Restons en contact</h2>
        <p className={styles.description}>
          Rejoignez notre communauté et ne manquez aucune nouveauté sur nos jeux
          !
        </p>

        {/* Grille de cartes de contact */}
        <div className={styles.contactGrid}>
          {/* Email */}
          <a
            href="mailto:jimmy@ninjasasquatch.com"
            className={styles.contactCard}
          >
            <div className={styles.iconWrapper}>
              <Mail size={32} />
            </div>
            <h3 className={styles.cardTitle}>Email</h3>
            <p className={styles.cardText}>jimmy@ninjasasquatch.com</p>
            <span className={styles.cardCta}>Nous écrire →</span>
          </a>

          {/* Youtube */}
          <a
            href="https://www.youtube.com/@JimmyGaulin"
            className={styles.contactCard}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.iconWrapper}>
              <Youtube size={32} />
            </div>
            <h3 className={styles.cardTitle}>YouTube</h3>
            <p className={styles.cardText}>Tutoriels et gameplay</p>
            <span className={styles.cardCta}>S'abonner →</span>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/NinjaSasquatch"
            className={styles.contactCard}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.iconWrapper}>
              <Facebook size={32} />
            </div>
            <h3 className={styles.cardTitle}>Facebook</h3>
            <p className={styles.cardText}>Actualités et communauté</p>
            <span className={styles.cardCta}>Suivre →</span>
          </a>
        </div>

        {/* Call to action pour Kickstarter */}
        <div className={styles.ctaBox}>
          <Bell size={32} className={styles.bellIcon} />
          <h3 className={styles.ctaTitle}>
            Campagne Kickstarter en Mars 2026 !
          </h3>
          <p className={styles.ctaText}>
            Soyez parmi les premiers à découvrir Heroes Rising et bénéficiez
            d'avantages exclusifs en nous suivant dès maintenant.
          </p>
        </div>
      </div>
    </section>
  );
}
