// Source unique des liens de réseaux sociaux réels de Ninja Sasquatch Games
// (fournis et validés — décision utilisateur Sprint 10, résout D12). Aucun
// href="#", aucun placeholder. Kickstarter n'apparaît PAS ici : il n'est
// affiché que par jeu, et seulement si une URL publique existe (fiche jeu).
import { Facebook, Youtube, Linkedin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  id: string;
  href: string;
  // Clé i18n de l'étiquette accessible (résolue au rendu avec t()).
  labelKey: string;
  // Icône décorative — masquée aux lecteurs d'écran par le composant.
  Icon: LucideIcon;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: "facebook",
    href: "https://www.facebook.com/NinjaSasquatch/",
    labelKey: "social.facebook",
    Icon: Facebook,
  },
  {
    id: "youtube",
    href: "https://www.youtube.com/@JimmyGaulin",
    labelKey: "social.youtube",
    Icon: Youtube,
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/company/107198647/",
    labelKey: "social.linkedin",
    Icon: Linkedin,
  },
] as const;
