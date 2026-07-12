import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { CONTACT_EMAIL } from "../../../data/site";
import { buildMailtoUrl } from "../../../utils/mailto";
import type { ContactFormValues } from "../../../utils/mailto";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// Classes communes aux champs (input et textarea) ; la couleur de bordure
// vit dans le ternaire d'erreur (border-error/border-roux) car l'ordre des
// classes dans className ne départage pas deux utilitaires en conflit.
const fieldBase =
  "w-full rounded-lg border-2 bg-cream px-4 py-3 text-[1rem] transition-colors duration-300 focus:border-forest focus:outline-none motion-reduce:transition-none";

const socialLink =
  "text-charcoal transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

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
    <section id="contact" className="bg-cream py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-[2.5rem] font-extrabold tracking-[-0.01em] text-roux md:text-[3rem]">
          {t("contact.title")}
        </h2>
        <p className="mb-12 text-center text-lg/[1.6] text-charcoal">
          {t("contact.description")}
        </p>

        <div className="rounded-lg bg-white p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
          <form className="flex flex-col gap-8" noValidate onSubmit={handleSubmit}>
            <div className="grid grid-cols-[1fr] gap-8 md:grid-cols-[repeat(2,1fr)]">
              <div className="flex flex-col">
                <label
                  htmlFor="contact-name"
                  className="mb-2 block font-medium text-charcoal"
                >
                  {t("contact.name")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className={`${fieldBase} ${
                    errors.name ? "border-error" : "border-roux"
                  }`}
                  placeholder={t("contact.namePlaceholder")}
                  value={values.name}
                  onChange={handleChange("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="mt-2 text-sm/[1.6] text-error">
                    {t(errors.name)}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="contact-email"
                  className="mb-2 block font-medium text-charcoal"
                >
                  {t("contact.email")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className={`${fieldBase} ${
                    errors.email ? "border-error" : "border-roux"
                  }`}
                  placeholder={t("contact.emailPlaceholder")}
                  value={values.email}
                  onChange={handleChange("email")}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="mt-2 text-sm/[1.6] text-error">
                    {t(errors.email)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="contact-message"
                className="mb-2 block font-medium text-charcoal"
              >
                {t("contact.message")}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                className={`${fieldBase} min-h-32 resize-y ${
                  errors.message ? "border-error" : "border-roux"
                }`}
                placeholder={t("contact.messagePlaceholder")}
                value={values.message}
                onChange={handleChange("message")}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && (
                <p className="mt-2 text-sm/[1.6] text-error">
                  {t(errors.message)}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-forest px-8 py-4 font-brand text-[1rem] font-bold tracking-[0.02em] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition-opacity duration-300 hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              {t("contact.send")}
            </button>

            {submitted && (
              <p className="text-center font-medium text-forest" role="status">
                {t("contact.success")}
              </p>
            )}
          </form>
        </div>

        <div className="mt-12 flex justify-center gap-6">
          {/* href="#" = placeholders D12 (ROADMAP item 4.4, Décision requise :
              URLs réelles à fournir ou icônes à retirer). Le verrou
              anchor-is-valid est suspendu localement en attendant la décision —
              retirer ces disables en résolvant 4.4. */}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" className={socialLink} aria-label="Instagram">
            <Instagram size={28} />
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" className={socialLink} aria-label="Facebook">
            <Facebook size={28} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={socialLink}
            aria-label="Email"
          >
            <Mail size={28} />
          </a>
        </div>
      </div>
    </section>
  );
}
