// JSON-LD Organization autonome (composable). PageMeta l'émet déjà sur chaque
// page via meta.jsonLd ; ce composant sert aux compositions sur mesure/tests.
import { getSiteUrl } from "../../seo/config";
import { organizationJsonLd } from "../../seo/jsonLd";
import JsonLdScript from "./JsonLdScript";

export default function OrganizationJsonLd() {
  return <JsonLdScript data={organizationJsonLd(getSiteUrl())} />;
}
