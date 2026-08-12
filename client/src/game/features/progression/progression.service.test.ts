import { describe, expect, it } from "vitest";
import { STARTING_RESOURCES } from "@shared/game/constants";
import type { SettlementState } from "@shared/game/types";
import { advanceSettlement, evaluateSettlementProgression } from "./progression.service";

const camp: SettlementState = {
  id: "river-camp",
  name: "River Camp",
  regionId: "great-river-spine",
  tier: "founding-camp",
  population: 8,
  storage: STARTING_RESOURCES,
  buildings: [],
};

describe("settlement progression", () => {
  it("reports explicit camp-to-village blockers", () => {
    const evaluation = evaluateSettlementProgression(camp);

    expect(evaluation.canAdvance).toBe(false);
    expect(evaluation.nextTier).toBe("village");
    expect(evaluation.unmetRequirements).toContain("Population: 8/12");
    expect(evaluation.unmetRequirements).toContain("Construct: granary");
  });

  it("advances only when every requirement is satisfied", () => {
    const readyCamp: SettlementState = {
      ...camp,
      population: 12,
      storage: { ...STARTING_RESOURCES, crops: 30, fish: 8 },
      buildings: [
        { id: "longhouse", kind: "longhouse", position: { x: 1, y: 1 }, rotationQuarterTurns: 0, constructedAtTick: 1 },
        { id: "granary", kind: "granary", position: { x: 4, y: 1 }, rotationQuarterTurns: 0, constructedAtTick: 2 },
        { id: "council", kind: "council-house", position: { x: 6, y: 1 }, rotationQuarterTurns: 0, constructedAtTick: 3 },
      ],
    };

    expect(evaluateSettlementProgression(readyCamp).canAdvance).toBe(true);
    expect(advanceSettlement(readyCamp).tier).toBe("village");
  });
});
