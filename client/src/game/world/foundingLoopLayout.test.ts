import { describe, expect, it } from "vitest";

import { UnplayableWorldError, resolveFoundingLoopLayout } from "./foundingLoopLayout";
import { isWalkableTile, walkableRegion } from "./riverSpineReachability";

const BASE = {
  width: 32,
  height: 24,
  spawnTile: { x: 10, y: 14 },
  preferredCampTile: { x: 7, y: 12 },
  reedCount: 3,
  stoneCount: 2,
} as const;

describe("resolveFoundingLoopLayout", () => {
  it("returns validated spawn, beacon, camp, and gather tiles in one walkable region", () => {
    const layout = resolveFoundingLoopLayout({ ...BASE, seed: 20260812 });
    const region = walkableRegion(layout.map, layout.spawnTile);

    [layout.beaconTile, layout.campTile, ...layout.gatherPlacements.map((node) => node.tile)].forEach((tile) => {
      expect(isWalkableTile(layout.map, tile)).toBe(true);
      expect(region.has(`${tile.x}:${tile.y}`)).toBe(true);
    });
    expect(layout.gatherPlacements).toHaveLength(5);
  });

  it("is deterministic for a fixed seed", () => {
    const first = resolveFoundingLoopLayout({ ...BASE, seed: 415 });
    const second = resolveFoundingLoopLayout({ ...BASE, seed: 415 });

    expect(second.beaconTile).toEqual(first.beaconTile);
    expect(second.campTile).toEqual(first.campTile);
    expect(second.gatherPlacements).toEqual(first.gatherPlacements);
  });

  it("fails loudly when the spawn tile is not on walkable ground", () => {
    const river = { x: 16, y: 14 } as const;
    expect(() => resolveFoundingLoopLayout({ ...BASE, seed: 20260812, spawnTile: river }))
      .toThrow(UnplayableWorldError);
  });

  it("fails loudly when more gather nodes are required than the reachable bank can hold", () => {
    expect(() => resolveFoundingLoopLayout({ ...BASE, seed: 20260812, reedCount: 400, stoneCount: 400 }))
      .toThrow(UnplayableWorldError);
  });

  it("produces a playable layout across a sweep of seeds", () => {
    [1, 7, 415, 2_048, 20260812, 99_991].forEach((seed) => {
      expect(() => resolveFoundingLoopLayout({ ...BASE, seed })).not.toThrow();
    });
  });
});

