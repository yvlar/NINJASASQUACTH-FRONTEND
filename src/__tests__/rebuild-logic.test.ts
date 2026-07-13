// Verrou de l'anti-rafale de reconstruction (Sprint 11, Partie A). La logique
// pure garantit un délai minimal entre deux appels au Deploy Hook Vercel.
import { describe, it, expect } from "vitest";
import {
  shouldTriggerRebuild,
  DEFAULT_MIN_INTERVAL_MS,
} from "../../supabase/functions/trigger-rebuild/logic";

describe("shouldTriggerRebuild — délai minimal entre rebuilds", () => {
  const config = { minIntervalMs: DEFAULT_MIN_INTERVAL_MS };

  it("autorise la toute première demande", () => {
    expect(shouldTriggerRebuild(1_000_000, null, config)).toBe(true);
  });

  it("refuse une demande trop rapprochée", () => {
    const last = 1_000_000;
    expect(shouldTriggerRebuild(last + 30_000, last, config)).toBe(false);
  });

  it("autorise après l'intervalle minimal", () => {
    const last = 1_000_000;
    expect(
      shouldTriggerRebuild(last + DEFAULT_MIN_INTERVAL_MS, last, config),
    ).toBe(true);
  });
});
