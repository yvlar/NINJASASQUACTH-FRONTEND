// JSON-LD BreadcrumbList autonome (composable). Voir OrganizationJsonLd.
import { breadcrumbJsonLd } from "../../seo/jsonLd";
import JsonLdScript from "./JsonLdScript";

export default function BreadcrumbJsonLd({
  items,
}: {
  items: ReadonlyArray<{ name: string; url: string }>;
}) {
  return <JsonLdScript data={breadcrumbJsonLd(items)} />;
}
