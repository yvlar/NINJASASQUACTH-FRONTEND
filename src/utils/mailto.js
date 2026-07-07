// Utilitaire pur (module non-composant, hors de src/components/ pour
// respecter react-refresh/only-export-components) : construction de l'URL
// mailto: du formulaire de contact, verrouillée par src/__tests__/mailto.test.js.
import { CONTACT_EMAIL } from "../data/site";

// values : { name, email, message } (valeurs brutes du formulaire, trimées ici) ;
// subject : sujet déjà traduit (t("contact.subject")).
export function buildMailtoUrl(values, subject) {
  const encodedSubject = encodeURIComponent(subject);
  const body = encodeURIComponent(
    `${values.name.trim()} <${values.email.trim()}>\n\n${values.message.trim()}`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${body}`;
}
