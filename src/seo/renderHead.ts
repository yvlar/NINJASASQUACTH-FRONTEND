// Sérialise un PageMeta en fragment HTML pour le <head> du HTML PRÉ-RENDU.
// (Le runtime client, lui, passe par les composants React 19 de
// src/components/seo/ ; les deux consomment le même PageMeta — une seule
// source de vérité.) Aucune dépendance React : exécuté au build (Node).
import type { PageMeta } from "./buildMeta";
import { SITE_NAME } from "./config";

// Échappe le texte destiné à un attribut HTML entre guillemets doubles.
function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Échappe le texte d'un élément (<title>).
function text(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Sérialise le JSON-LD en neutralisant « < » (empêche une évasion de <script>).
function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

export function renderHeadTags(meta: PageMeta): string {
  const lines: string[] = [];

  lines.push(`<title>${text(meta.title)}</title>`);
  lines.push(`<meta name="description" content="${attr(meta.description)}" />`);

  if (meta.robots) {
    lines.push(`<meta name="robots" content="${attr(meta.robots)}" />`);
  }

  if (meta.canonical) {
    lines.push(`<link rel="canonical" href="${attr(meta.canonical)}" />`);
  }

  for (const alt of meta.alternates) {
    lines.push(
      `<link rel="alternate" hreflang="${attr(alt.hreflang)}" href="${attr(alt.href)}" />`,
    );
  }

  // OpenGraph
  lines.push(`<meta property="og:type" content="${attr(meta.ogType)}" />`);
  lines.push(`<meta property="og:site_name" content="${attr(SITE_NAME)}" />`);
  lines.push(`<meta property="og:title" content="${attr(meta.title)}" />`);
  lines.push(
    `<meta property="og:description" content="${attr(meta.description)}" />`,
  );
  if (meta.canonical) {
    lines.push(`<meta property="og:url" content="${attr(meta.canonical)}" />`);
  }
  lines.push(`<meta property="og:image" content="${attr(meta.image.url)}" />`);
  if (meta.image.width) {
    lines.push(
      `<meta property="og:image:width" content="${meta.image.width}" />`,
    );
  }
  if (meta.image.height) {
    lines.push(
      `<meta property="og:image:height" content="${meta.image.height}" />`,
    );
  }
  if (meta.image.type) {
    lines.push(
      `<meta property="og:image:type" content="${attr(meta.image.type)}" />`,
    );
  }
  lines.push(
    `<meta property="og:image:alt" content="${attr(meta.image.alt)}" />`,
  );
  lines.push(`<meta property="og:locale" content="${attr(meta.ogLocale)}" />`);
  lines.push(
    `<meta property="og:locale:alternate" content="${attr(meta.ogLocaleAlternate)}" />`,
  );

  // Twitter
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  lines.push(`<meta name="twitter:title" content="${attr(meta.title)}" />`);
  lines.push(
    `<meta name="twitter:description" content="${attr(meta.description)}" />`,
  );
  lines.push(`<meta name="twitter:image" content="${attr(meta.image.url)}" />`);
  lines.push(
    `<meta name="twitter:image:alt" content="${attr(meta.image.alt)}" />`,
  );

  for (const ld of meta.jsonLd) {
    lines.push(jsonLdScript(ld));
  }

  return lines.join("\n    ");
}
