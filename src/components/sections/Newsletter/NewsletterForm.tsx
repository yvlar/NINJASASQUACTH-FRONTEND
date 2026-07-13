// Formulaire de capture courriel « Être notifié au lancement » (Sprint 12,
// Partie H). Passe TOUJOURS par l'Edge Function (subscribeNewsletter) — jamais
// une insertion Supabase publique. Le message de succès n'apparaît QU'APRÈS
// confirmation de la fonction. Accessible : labels associés, aria-live pour le
// statut, honeypot masqué aux humains et aux lecteurs d'écran.
import { useId, useState } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { subscribeNewsletter } from "../../../utils/subscribeNewsletter";

type Status = "idle" | "loading" | "success" | "error";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm({ source }: { source: string }) {
  const { t, lang } = useLanguage();
  const emailId = useId();
  const consentId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorKey(null);

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setErrorKey("newsletter.invalidEmail");
      return;
    }
    if (!consent) {
      setErrorKey("newsletter.consentRequired");
      return;
    }

    setStatus("loading");
    const ok = await subscribeNewsletter({
      email: trimmed,
      locale: lang,
      source,
      website,
    });
    // Succès UNIQUEMENT sur confirmation de l'Edge Function.
    setStatus(ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-lg bg-forest/10 px-4 py-3 font-semibold text-forest"
      >
        {t("newsletter.success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-xl flex-col gap-4">
      {/* Honeypot : masqué (display:none) + hors tabulation + aria-hidden. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailId} className="font-semibold text-charcoal">
          {t("newsletter.emailLabel")}
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.emailPlaceholder")}
          aria-invalid={errorKey === "newsletter.invalidEmail" || undefined}
          aria-describedby={errorKey ? errorId : undefined}
          className="rounded-lg border-2 border-charcoal/20 bg-cream px-4 py-3 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
        <label htmlFor={consentId} className="text-sm/[1.5] text-charcoal">
          {t("newsletter.consent")}
        </label>
      </div>

      {errorKey && (
        <p id={errorId} role="alert" className="font-semibold text-error">
          {t(errorKey)}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="font-semibold text-error">
          {t("newsletter.error")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-forest px-6 py-3.5 font-brand text-lg/[1.4] text-cream shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <Bell size={18} aria-hidden />
        {status === "loading" ? t("newsletter.submitting") : t("newsletter.submit")}
      </button>
    </form>
  );
}
