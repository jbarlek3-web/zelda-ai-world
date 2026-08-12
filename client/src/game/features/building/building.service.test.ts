import { describe, expect, it } from "vitest";
import { EMPTY_RESOURCES, STARTING_RESOURCES } from "@shared/game/constants";
import type { SettlementState } from "@shared/game/types";
import { generateGreatRiverSpine, isBuildableFootprint, type GreatRiverSpineMap } from "@/game/world/greatRiverSpine";
import { placeBuilding } from "./building.service";

const settlement: SettlementState = {
  id: "settlement-river-camp",
  name: "River Camp",
  regionId: "great-river-spine",
  tier: "founding-camp",
  population: 8,
  storage: STARTING_RESOURCES,
  buildings: [],
};

function findLonghouseSite(map: GreatRiverSpineMap): { x: number; y: number } {
  const site = map.tiles.find((tile) => isBuildableFootprint(map, tile.position, { x: 3, y: 2 }));
  if (!site) {
    throw new Error("Expected the generated Great River Spine map to provide one longhouse site");
  }
  return site.position;
}

describe("placeBuilding", () => {
  it("places a valid building and deducts its explicit construction cost", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 24, height: 20 });
    const result = placeBuilding(map, settlement, {
      buildingId: "longhouse-1",
      kind: "longhouse",
      position: findLonghouseSite(map),
      rotationQuarterTurns: 0,
      simulationTick: 4,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.settlement.buildings).toHaveLength(1);
    expect(result.settlement.storage.wood).toBe(24);
    expect(result.settlement.storage.fibers).toBe(8);
  });

  it("rejects construction with insufficient resources", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 24, height: 20 });
    const result = placeBuilding(map, { ...settlement, storage: EMPTY_RESOURCES }, {
      buildingId: "longhouse-1",
      kind: "longhouse",
      position: findLonghouseSite(map),
      rotationQuarterTurns: 0,
      simulationTick: 4,
    });

    expect(result).toEqual({ ok: false, reason: "insufficient-resources" });
  });
});
