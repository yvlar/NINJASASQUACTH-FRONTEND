// JSON-LD Product+Game autonome (composable). Voir OrganizationJsonLd.
import { getSiteUrl } from "../../seo/config";
import { gameJsonLd } from "../../seo/jsonLd";
import { gamePath } from "../../utils/routes";
import JsonLdScript from "./JsonLdScript";
import type { GameRow } from "../../types/database";
import type { Lang } from "../../i18n/context";

export default function GameJsonLd({
  game,
  lang,
}: {
  game: GameRow;
  lang: Lang;
}) {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${gamePath(lang, game.slug ?? "")}`;
  return <JsonLdScript data={gameJsonLd(game, lang, { siteUrl, canonical })} />;
}
