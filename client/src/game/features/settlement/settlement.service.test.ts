import { describe, expect, it } from "vitest";
import { STARTING_RESOURCES } from "@shared/game/constants";
import type { SettlementState } from "@shared/game/types";
import { advanceSettlementSeason } from "./settlement.service";

const baseSettlement: SettlementState = {
  id: "river-camp",
  name: "River Camp",
  regionId: "great-river-spine",
  tier: "founding-camp",
  population: 8,
  storage: STARTING_RESOURCES,
  buildings: [],
};

describe("advanceSettlementSeason", () => {
  it("returns an explainable food balance without permitting negative storage", () => {
    const outcome = advanceSettlementSeason(baseSettlement);

    expect(outcome.foodRequired).toBe(3);
    expect(outcome.foodConsumed).toBe(3);
    expect(outcome.foodShortfall).toBe(0);
    expect(outcome.settlement.storage.crops).toBeGreaterThanOrEqual(0);
    expect(outcome.settlement.storage.fish).toBeGreaterThanOrEqual(0);
    expect(outcome.explanations).toContain("Seasonal food need: 3.");
  });

  it("exposes shortages instead of silently creating food", () => {
    const outcome = advanceSettlementSeason({
      ...baseSettlement,
      population: 20,
      storage: { ...STARTING_RESOURCES, crops: 0, fish: 0 },
    });

    expect(outcome.foodRequired).toBe(7);
    expect(outcome.foodConsumed).toBe(3);
    expect(outcome.foodShortfall).toBe(4);
    expect(outcome.explanations.at(-1)).toContain("food shortfall");
  });
});
