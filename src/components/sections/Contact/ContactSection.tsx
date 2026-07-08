import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { CONTACT_EMAIL } from "../../../data/site";
import { buildMailtoUrl } from "../../../utils/mailto";
import type { ContactFormValues } from "../../../utils/mailto";
import styles from "./Contact.module.css";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// errors contient des clés i18n (jamais du texte), traduites au rendu pour
// que les messages suivent la bascule de langue.
type ContactErrors = Partial<Record<keyof ContactFormValues, string>>;

export default function ContactSection() {
  const { t } = useLanguage();
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof ContactFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitted(false);
    };

  const validate = (): ContactErrors => {
    const nextErrors: ContactErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "contact.errors.nameRequired";
    }
    if (!values.email.trim()) {
      nextErrors.email = "contact.errors.emailRequired";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "contact.errors.emailInvalid";
    }
    if (!values.message.trim()) {
      nextErrors.message = "contact.errors.messageRequired";
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    window.location.href = buildMailtoUrl(values, t("contact.subject"));
    setSubmitted(true);
  };

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("contact.title")}</h2>
        <p className={styles.description}>{t("contact.description")}</p>

        <div className={styles.formCard}>
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="contact-name" className={styles.label}>
                  {t("contact.name")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className={`${styles.input} ${
                    errors.name ? styles.inputError : ""
                  }`}
                  placeholder={t("contact.namePlaceholder")}
                  value={values.name}
                  onChange={handleChange("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className={styles.errorText}>{t(errors.name)}</p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.label}>
                  {t("contact.email")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className={`${styles.input} ${
                    errors.email ? styles.inputError : ""
                  }`}
                  placeholder={t("contact.emailPlaceholder")}
                  value={values.email}
                  onChange={handleChange("email")}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className={styles.errorText}>{t(errors.email)}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-message" className={styles.label}>
                {t("contact.message")}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                className={`${styles.textarea} ${
                  errors.message ? styles.inputError : ""
                }`}
                placeholder={t("contact.messagePlaceholder")}
                value={values.message}
                onChange={handleChange("message")}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && (
                <p className={styles.errorText}>{t(errors.message)}</p>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              {t("contact.send")}
            </button>

            {submitted && (
              <p className={styles.successText} role="status">
                {t("contact.success")}
              </p>
            )}
          </form>
        </div>

        <div className={styles.socialLinks}>
          {/* href="#" = placeholders D12 (ROADMAP item 4.4, Décision requise :
              URLs réelles à fournir ou icônes à retirer). Le verrou
              anchor-is-valid est suspendu localement en attendant la décision —
              retirer ces disables en résolvant 4.4. */}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" className={styles.socialLink} aria-label="Instagram">
            <Instagram size={28} />
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" className={styles.socialLink} aria-label="Facebook">
            <Facebook size={28} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={styles.socialLink}
            aria-label="Email"
          >
            <Mail size={28} />
          </a>
        </div>
      </div>
    </section>
  );
}
