// Constructeur de métadonnées pur (Sprint 11, Parties C/D). Une seule source
// de vérité pour :
//   - le pré-rendu (injection directe dans le <head> du HTML produit)
//   - le runtime client (composants React 19 de <src/components/seo/>)
// Aucune dépendance React ni DOM : importable au build (Node) comme au client.
import { getSiteUrl, SITE_NAME, BRAND_OG_IMAGE } from "./config";
import { lookup } from "./i18nLookup";
import {
  organizationJsonLd,
  websiteJsonLd,
  gameJsonLd,
  breadcrumbJsonLd,
  type JsonLd,
} from "./jsonLd";
import { localizeGame } from "../utils/localizeGame";
import { gamePath, homePath } from "../utils/routes";
import type { GameRow } from "../types/database";
import type { Lang } from "../i18n/context";

export interface HeadAlternate {
  hreflang: string;
  href: string;
}

export interface HeadImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface PageMeta {
  lang: Lang;
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  alternates: HeadAlternate[];
  ogType: string;
  ogLocale: string;
  ogLocaleAlternate: string;
  image: HeadImage;
  jsonLd: JsonLd[];
}

export type MetaInput =
  | { kind: "home"; lang: Lang }
  | { kind: "game"; lang: Lang; game: GameRow }
  | { kind: "notFound"; lang: Lang };

const OG_LOCALE: Record<Lang, string> = { fr: "fr_CA", en: "en_CA" };
const otherLang = (lang: Lang): Lang => (lang === "fr" ? "en" : "fr");

function abs(siteUrl: string, path: string): string {
  return `${siteUrl}${path}`;
}

function brandImage(siteUrl: string, lang: Lang): HeadImage {
  return {
    url: abs(siteUrl, BRAND_OG_IMAGE.path),
    width: BRAND_OG_IMAGE.width,
    height: BRAND_OG_IMAGE.height,
    type: BRAND_OG_IMAGE.type,
    alt: lookup(lang, "seo.ogImageAlt"),
  };
}

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function buildMeta(
  input: MetaInput,
  opts: { siteUrl?: string } = {},
): PageMeta {
  const siteUrl = opts.siteUrl ?? getSiteUrl();
  const { lang } = input;
  const ogLocale = OG_LOCALE[lang];
  const ogLocaleAlternate = OG_LOCALE[otherLang(lang)];

  if (input.kind === "home") {
    const canonical = abs(siteUrl, homePath(lang));
    return {
      lang,
      title: lookup(lang, "seo.home.title"),
      description: lookup(lang, "seo.home.description"),
      canonical,
      alternates: [
        { hreflang: "fr", href: abs(siteUrl, homePath("fr")) },
        { hreflang: "en", href: abs(siteUrl, homePath("en")) },
        { hreflang: "x-default", href: abs(siteUrl, homePath("fr")) },
      ],
      ogType: "website",
      ogLocale,
      ogLocaleAlternate,
      image: brandImage(siteUrl, lang),
      jsonLd: [organizationJsonLd(siteUrl), websiteJsonLd(siteUrl)],
    };
  }

  if (input.kind === "game") {
    const { game } = input;
    const slug = game.slug ?? "";
    const { title, shortDesc, fullDesc } = localizeGame(game, lang);
    const tagline = lang === "en" ? game.tagline_en : game.tagline_fr;
    const description = truncate(shortDesc || tagline || fullDesc || "");
    const canonical = abs(siteUrl, gamePath(lang, slug));
    const image: HeadImage = game.image_url
      ? { url: game.image_url, alt: title }
      : brandImage(siteUrl, lang);

    return {
      lang,
      title: `${title} — ${lookup(lang, "seo.game.titleSuffix")}`,
      description,
      canonical,
      alternates: [
        { hreflang: "fr", href: abs(siteUrl, gamePath("fr", slug)) },
        { hreflang: "en", href: abs(siteUrl, gamePath("en", slug)) },
        { hreflang: "x-default", href: abs(siteUrl, gamePath("fr", slug)) },
      ],
      ogType: "article",
      ogLocale,
      ogLocaleAlternate,
      image,
      jsonLd: [
        organizationJsonLd(siteUrl),
        gameJsonLd(game, lang, { siteUrl, canonical }),
        breadcrumbJsonLd([
          { name: SITE_NAME, url: abs(siteUrl, homePath(lang)) },
          { name: title, url: canonical },
        ]),
      ],
    };
  }

  // 404 : indexation interdite, pas de canonical ni d'alternates.
  return {
    lang,
    title: lookup(lang, "seo.notFound.title"),
    description: lookup(lang, "seo.notFound.description"),
    robots: "noindex, follow",
    alternates: [],
    ogType: "website",
    ogLocale,
    ogLocaleAlternate,
    image: brandImage(siteUrl, lang),
    jsonLd: [organizationJsonLd(siteUrl)],
  };
}
