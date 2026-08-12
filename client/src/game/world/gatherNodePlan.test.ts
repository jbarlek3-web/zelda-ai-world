import { describe, expect, it } from "vitest";

import { generateGreatRiverSpine } from "./greatRiverSpine";
import { planGatherNodes } from "./gatherNodePlan";
import { isWalkableTile, walkableRegion } from "./riverSpineReachability";

const SPAWN = { x: 10, y: 14 } as const;
const SEEDS = [1, 415, 2_048, 77_777] as const;

function planFor(seed: number) {
  const map = generateGreatRiverSpine({ seed, width: 32, height: 24 });
  return { map, plan: planGatherNodes({ map, spawnTile: SPAWN, reedCount: 3, stoneCount: 2 }) };
}

describe("planGatherNodes", () => {
  it("produces the requested reed and stone counts", () => {
    const { plan } = planFor(415);
    expect(plan.filter((node) => node.kind === "river-reed")).toHaveLength(3);
    expect(plan.filter((node) => node.kind === "smooth-stone")).toHaveLength(2);
  });

  it("is deterministic for the same seed", () => {
    expect(planFor(415).plan).toEqual(planFor(415).plan);
  });

  it("varies placement across seeds", () => {
    expect(planFor(415).plan).not.toEqual(planFor(416).plan);
  });

  it("keeps every node walkable and reachable from the spawn tile", () => {
    SEEDS.forEach((seed) => {
      const { map, plan } = planFor(seed);
      const region = walkableRegion(map, SPAWN);
      expect(plan).toHaveLength(5);
      plan.forEach((node) => {
        expect(isWalkableTile(map, node.tile)).toBe(true);
        expect(region.has(`${node.tile.x}:${node.tile.y}`)).toBe(true);
      });
    });
  });

  it("never places two nodes on the same or adjacent tiles", () => {
    SEEDS.forEach((seed) => {
      const { plan } = planFor(seed);
      plan.forEach((node, index) => {
        plan.slice(index + 1).forEach((other) => {
          expect(Math.abs(node.tile.x - other.tile.x) + Math.abs(node.tile.y - other.tile.y)).toBeGreaterThanOrEqual(2);
        });
      });
    });
  });

  it("returns nothing when the spawn tile is not walkable", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 32, height: 24 });
    const river = map.tiles.find((tile) => tile.kind === "river");
    expect(planGatherNodes({ map, spawnTile: river!.position, reedCount: 3, stoneCount: 2 })).toEqual([]);
  });
});

