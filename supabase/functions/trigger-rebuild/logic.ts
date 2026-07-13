// Logique PURE de la reconstruction contrôlée (Sprint 11, Partie A). Testable
// en Vitest — le handler Deno n'orchestre que l'IO (auth, DB, Deploy Hook).
//
// Anti-rafale : on n'appelle le Deploy Hook Vercel qu'au plus une fois par
// intervalle minimal, quel que soit le nombre de publications rapprochées.

export interface DebounceConfig {
  minIntervalMs: number;
}

// `true` si assez de temps s'est écoulé depuis la dernière demande. Une
// première demande (lastRequestedAt null) est toujours autorisée.
export function shouldTriggerRebuild(
  now: number,
  lastRequestedAt: number | null,
  config: DebounceConfig,
): boolean {
  if (lastRequestedAt == null) return true;
  return now - lastRequestedAt >= config.minIntervalMs;
}

// Intervalle minimal par défaut entre deux rebuilds : 2 minutes.
export const DEFAULT_MIN_INTERVAL_MS = 2 * 60 * 1000;
