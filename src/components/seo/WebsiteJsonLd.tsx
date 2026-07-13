// JSON-LD WebSite autonome (composable). Voir la note d'OrganizationJsonLd.
import { getSiteUrl } from "../../seo/config";
import { websiteJsonLd } from "../../seo/jsonLd";
import JsonLdScript from "./JsonLdScript";

export default function WebsiteJsonLd() {
  return <JsonLdScript data={websiteJsonLd(getSiteUrl())} />;
}
