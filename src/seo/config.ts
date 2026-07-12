// Configuration SEO centralisée (Sprint 11, Parties C/D).
// Le domaine final vit dans une variable d'environnement de build/serveur —
// jamais codé « [domaine] » en dur. Ordre de résolution :
//   1. import.meta.env.VITE_SITE_URL (build Vite / runtime client)
//   2. valeur par défaut = domaine de production Vercel actuel
// À remplacer par le domaine personnalisé définitif dès qu'il existe (poser
// VITE_SITE_URL dans les variables Vercel + SITE_URL pour le pré-rendu Node).
const DEFAULT_SITE_URL = "https://ninjasasquacth-frontend.vercel.app";

// `import.meta.env` n'existe qu'en contexte Vite ; le script de pré-rendu Node
// passe l'URL explicitement à `buildMeta`, donc ce module reste utilisable des
// deux côtés. On lit l'env Vite sans planter si `import.meta.env` est absent.
function readViteSiteUrl(): string | undefined {
  try {
    return import.meta.env?.VITE_SITE_URL as string | undefined;
  } catch {
    return undefined;
  }
}

// Normalise : pas de barre oblique finale (les chemins commencent par « / »).
export function normalizeSiteUrl(raw: string): string {
  return raw.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(readViteSiteUrl() || DEFAULT_SITE_URL);
}

export const SITE_NAME = "Ninja Sasquatch Games";

// Image OpenGraph de repli de marque — un fichier RÉEL qui existe dans le
// dépôt (`public/og/brand.svg`). On n'utilise jamais une image OG inexistante.
export const BRAND_OG_IMAGE = {
  path: "/og/brand.svg",
  width: 1200,
  height: 630,
  type: "image/svg+xml",
} as const;

// Réseaux sociaux officiels — source des `sameAs` du JSON-LD Organization.
// (Miroir de src/data/socialLinks.ts, sans dépendance à lucide/React pour
// rester importable depuis le script de pré-rendu Node.)
export const ORGANIZATION_SAME_AS = [
  "https://www.facebook.com/NinjaSasquatch/",
  "https://www.youtube.com/@JimmyGaulin",
  "https://www.linkedin.com/company/107198647/",
] as const;

export const FOUNDER_NAME = "Jimmy Gaulin";
export const ORGANIZATION_ALTERNATE_NAME = "Jeux Ninja Sasquatch";
export const AREA_SERVED = "CA-QC";
