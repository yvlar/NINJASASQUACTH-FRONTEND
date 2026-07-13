// Métadonnées de page côté client (Sprint 11, Parties C/D). React 19 hisse
// automatiquement <title>/<meta>/<link> rendus n'importe où vers le <head> :
// la SPA met donc à jour ses balises SEO à chaque navigation. Le PRÉ-RENDU,
// lui, injecte les mêmes balises via seo/renderHead.ts — les deux consomment
// le même `buildMeta`, une seule source de vérité.
import { buildMeta, type MetaInput } from "../../seo/buildMeta";
import { SITE_NAME } from "../../seo/config";
import JsonLdScript from "./JsonLdScript";

export default function PageMeta({ input }: { input: MetaInput }) {
  const meta = buildMeta(input);

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.robots && <meta name="robots" content={meta.robots} />}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      {meta.alternates.map((alt) => (
        <link
          key={alt.hreflang}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}

      <meta property="og:type" content={meta.ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      {meta.canonical && <meta property="og:url" content={meta.canonical} />}
      <meta property="og:image" content={meta.image.url} />
      {meta.image.width && (
        <meta property="og:image:width" content={String(meta.image.width)} />
      )}
      {meta.image.height && (
        <meta property="og:image:height" content={String(meta.image.height)} />
      )}
      {meta.image.type && (
        <meta property="og:image:type" content={meta.image.type} />
      )}
      <meta property="og:image:alt" content={meta.image.alt} />
      <meta property="og:locale" content={meta.ogLocale} />
      <meta property="og:locale:alternate" content={meta.ogLocaleAlternate} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image.url} />
      <meta name="twitter:image:alt" content={meta.image.alt} />

      {meta.jsonLd.map((ld, i) => (
        <JsonLdScript key={i} data={ld} />
      ))}
    </>
  );
}
