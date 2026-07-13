// Constructeurs JSON-LD purs (Sprint 11, Partie D). Aucune dépendance React :
// utilisables côté client et dans le pré-rendu Node. Règle d'or : n'inclure
// QUE des propriétés réellement connues du jeu. JAMAIS de prix, devise, offre,
// avis, note, disponibilité, ni date Kickstarter inventés.
import {
  SITE_NAME,
  ORGANIZATION_ALTERNATE_NAME,
  ORGANIZATION_SAME_AS,
  FOUNDER_NAME,
  AREA_SERVED,
  BRAND_OG_IMAGE,
} from "./config";
import { lookup } from "./i18nLookup";
import { localizeGame } from "../utils/localizeGame";
import type { GameRow } from "../types/database";
import type { Lang } from "../i18n/context";

export type JsonLd = Record<string, unknown>;

const SCHEMA = "https://schema.org";

export function organizationJsonLd(siteUrl: string): JsonLd {
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ORGANIZATION_ALTERNATE_NAME,
    url: siteUrl,
    logo: `${siteUrl}${BRAND_OG_IMAGE.path}`,
    founder: { "@type": "Person", name: FOUNDER_NAME },
    areaServed: AREA_SERVED,
    sameAs: [...ORGANIZATION_SAME_AS],
  };
}

export function websiteJsonLd(siteUrl: string): JsonLd {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: ["fr-CA", "en-CA"],
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

// Fil d'ariane : liste de { name, url } déjà absolus.
export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
): JsonLd {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Product + Game : uniquement les champs réellement présents sur la ligne.
export function gameJsonLd(
  game: GameRow,
  lang: Lang,
  opts: { siteUrl: string; canonical: string },
): JsonLd {
  const { title, shortDesc, fullDesc } = localizeGame(game, lang);
  const description = shortDesc || fullDesc || undefined;

  const ld: JsonLd = {
    "@context": SCHEMA,
    "@type": ["Product", "Game"],
    name: title,
    url: opts.canonical,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: lookup(lang, `games.categories.${game.category}`),
  };

  if (description) ld.description = description;

  // Image absolue seulement si une vraie photo existe.
  if (game.image_url) ld.image = game.image_url;

  // Nombre de joueurs → QuantitativeValue (min/max réels seulement).
  if (game.players_min != null || game.players_max != null) {
    const npv: JsonLd = { "@type": "QuantitativeValue", unitText: "player" };
    if (game.players_min != null) npv.minValue = game.players_min;
    if (game.players_max != null) npv.maxValue = game.players_max;
    ld.numberOfPlayers = npv;
  }

  // Durée réelle → ISO 8601 (minutes). Bornes seulement si connues.
  if (game.duration_max != null) {
    ld.timeRequired = `PT${game.duration_max}M`;
  } else if (game.duration_min != null) {
    ld.timeRequired = `PT${game.duration_min}M`;
  }

  // Âge minimum → audience (PeopleAudience.suggestedMinAge).
  if (game.minimum_age != null) {
    ld.audience = {
      "@type": "PeopleAudience",
      suggestedMinAge: game.minimum_age,
    };
  }

  // Langues du jeu réelles.
  if (game.game_languages && game.game_languages.length > 0) {
    ld.inLanguage = game.game_languages;
  }

  // Complexité et mécaniques → additionalProperty (données réelles, non
  // normalisées par schema.org — on ne les force pas dans un champ inadapté).
  const extra: JsonLd[] = [];
  if (game.complexity) {
    extra.push({
      "@type": "PropertyValue",
      name: lookup(lang, "games.detail.complexity"),
      value: game.complexity,
    });
  }
  if (game.mechanics && game.mechanics.length > 0) {
    ld.keywords = game.mechanics.join(", ");
  }
  if (extra.length > 0) ld.additionalProperty = extra;

  return ld;
}
