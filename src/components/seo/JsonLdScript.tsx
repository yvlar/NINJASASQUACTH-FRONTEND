// Primitive JSON-LD : rend un <script type="application/ld+json">. Le « < »
// est neutralisé pour empêcher toute évasion de balise. Google lit le JSON-LD
// où qu'il soit dans le document (head ou body).
import type { JsonLd } from "../../seo/jsonLd";

export default function JsonLdScript({ data }: { data: JsonLd }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // JSON sérialisé et « < » neutralisé ci-dessus (pas d'évasion de balise)
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
