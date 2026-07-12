// Rangée de liens sociaux réels, accessible et réutilisable (Footer + Contact).
// - vrais liens (jamais href="#"), nouvel onglet + rel="noreferrer"
// - étiquette accessible localisée sur chaque <a>
// - icône décorative masquée aux lecteurs d'écran (aria-hidden)
import { useLanguage } from "../../../i18n/useLanguage";
import { SOCIAL_LINKS } from "../../../data/socialLinks";

export default function SocialLinks({
  className = "",
  linkClassName,
}: {
  className?: string;
  // Couleurs portées par le parent (charbon sur crème, crème sur charbon…).
  linkClassName: string;
}) {
  const { t } = useLanguage();

  return (
    <ul className={`flex list-none items-center gap-6 ${className}`.trim()}>
      {SOCIAL_LINKS.map(({ id, href, labelKey, Icon }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={t(labelKey)}
            className={`inline-flex transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${linkClassName}`}
          >
            <Icon size={24} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
