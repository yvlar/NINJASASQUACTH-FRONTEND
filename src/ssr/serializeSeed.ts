// Sérialisation SÛRE de l'amorce de pré-rendu (Sprint 11.1). Le HTML pré-rendu
// embarque les données de la route dans un <script type="application/json"> ;
// le client les relit AVANT le premier rendu pour hydrater à l'identique.
//
// L'amorce ne contient QUE des données publiques (jeux publiés + leurs médias) —
// jamais de secret, d'email, de brouillon ni d'URL privée : le script de
// pré-rendu ne lit que les lignes publiées via la clé publiable.
import type { PrerenderData } from "./prerenderContext";

export const PRERENDER_SCRIPT_ID = "__PRERENDER_DATA__";

// Échappe la charge JSON pour une inclusion sûre dans un <script> : on neutralise
// « </script> », les chevrons, l'esperluette et les séparateurs de ligne
// U+2028 / U+2029 (valides en JSON mais qui casseraient le contexte HTML). Ces
// caractères n'apparaissent que dans des valeurs de chaîne JSON → le document
// reste du JSON valide après échappement.
export function serializePrerenderData(data: PrerenderData): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// Lecture de l'amorce côté client. Retourne null si absente ou illisible → les
// hooks reprennent alors leur comportement de fetch habituel.
export function readPrerenderSeed(): PrerenderData | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(PRERENDER_SCRIPT_ID);
  const raw = el?.textContent?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PrerenderData;
  } catch {
    return null;
  }
}
