// Génération sitemap.xml + robots.txt (Sprint 11, Partie E). Module pur.
// Le sitemap contient : accueil FR, accueil EN, chaque jeu PUBLIÉ FR/EN, avec
// les alternates linguistiques (xhtml:link). Exclus : /admin, les brouillons
// (non publiés), les pages de test, les URLs invalides.
import type { GameRow } from "../types/database";
import { gamePath, homePath } from "../utils/routes";
import { normalizeSiteUrl } from "../seo/config";

interface SitemapUrl {
  loc: string;
  alternates: { hreflang: string; href: string }[];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function homeUrls(site: string): SitemapUrl[] {
  const alternates = [
    { hreflang: "fr", href: `${site}${homePath("fr")}` },
    { hreflang: "en", href: `${site}${homePath("en")}` },
    { hreflang: "x-default", href: `${site}${homePath("fr")}` },
  ];
  return [
    { loc: `${site}${homePath("fr")}`, alternates },
    { loc: `${site}${homePath("en")}`, alternates },
  ];
}

function gameUrls(site: string, game: GameRow): SitemapUrl[] {
  const slug = game.slug as string;
  const alternates = [
    { hreflang: "fr", href: `${site}${gamePath("fr", slug)}` },
    { hreflang: "en", href: `${site}${gamePath("en", slug)}` },
    { hreflang: "x-default", href: `${site}${gamePath("fr", slug)}` },
  ];
  return [
    { loc: `${site}${gamePath("fr", slug)}`, alternates },
    { loc: `${site}${gamePath("en", slug)}`, alternates },
  ];
}

export function buildSitemap(games: GameRow[], siteUrl: string): string {
  const site = normalizeSiteUrl(siteUrl);
  // Défense en profondeur : ne jamais indexer un brouillon ni un jeu sans slug.
  const published = games.filter((g) => g.published && g.slug);

  const urls: SitemapUrl[] = [
    ...homeUrls(site),
    ...published.flatMap((g) => gameUrls(site, g)),
  ];

  const body = urls
    .map((u) => {
      const links = u.alternates
        .map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.hreflang)}" href="${xmlEscape(a.href)}" />`,
        )
        .join("\n");
      return `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n${links}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export function buildRobots(siteUrl: string): string {
  const site = normalizeSiteUrl(siteUrl);
  return [
    "User-agent: *",
    "Allow: /",
    // Espace d'administration : jamais exploré ni indexé.
    "Disallow: /admin",
    "",
    `Sitemap: ${site}/sitemap.xml`,
    "",
  ].join("\n");
}
