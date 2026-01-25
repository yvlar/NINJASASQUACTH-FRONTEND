import React from "react";
import { Instagram, Facebook, Mail } from "lucide-react";
import styles from "./Contact.module.css";

export default function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Contactez-nous</h2>
        <p className={styles.description}>
          Une question ? Un projet de collaboration ? Envie de découvrir nos
          jeux ? Écrivez-nous !
        </p>

        <div className={styles.formCard}>
          <form className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Votre nom"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Message</label>
              <textarea
                rows="5"
                className={styles.textarea}
                placeholder="Votre message..."
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Envoyer le message
            </button>
          </form>
        </div>

        <div className={styles.socialLinks}>
          <a href="#" className={styles.socialLink} aria-label="Instagram">
            <Instagram size={28} />
          </a>
          <a href="#" className={styles.socialLink} aria-label="Facebook">
            <Facebook size={28} />
          </a>
          <a href="#" className={styles.socialLink} aria-label="Email">
            <Mail size={28} />
          </a>
        </div>
      </div>
    </section>
  );
}
