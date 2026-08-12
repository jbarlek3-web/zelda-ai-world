import { describe, expect, it } from "vitest";

import { generateGreatRiverSpine, tileAt } from "./greatRiverSpine";
import {
  isWalkableTile,
  nearestReachableTile,
  validateObjectiveReachability,
  walkableRegion,
} from "./riverSpineReachability";

const SEEDS = [1, 7, 415, 2_048, 99_991] as const;

function firstWalkableTile(map: ReturnType<typeof generateGreatRiverSpine>) {
  const tile = map.tiles.find((candidate) => isWalkableTile(map, candidate.position));
  if (!tile) throw new Error("generated map has no walkable tile");
  return tile.position;
}

describe("river spine reachability", () => {
  it("treats river tiles as impassable and banks as walkable", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const river = map.tiles.find((tile) => tile.kind === "river");
    const grass = map.tiles.find((tile) => tile.kind === "grass");

    expect(river).toBeDefined();
    expect(grass).toBeDefined();
    expect(isWalkableTile(map, river!.position)).toBe(false);
    expect(isWalkableTile(map, grass!.position)).toBe(true);
  });

  it("returns an empty region when the origin itself is impassable", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const river = map.tiles.find((tile) => tile.kind === "river");

    expect(walkableRegion(map, river!.position).size).toBe(0);
  });

  it("reports unreachable objectives instead of silently accepting them", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const origin = firstWalkableTile(map);
    const river = map.tiles.find((tile) => tile.kind === "river");

    const report = validateObjectiveReachability(map, origin, [origin, river!.position]);
    expect(report.ok).toBe(false);
    expect(report.unreachable).toEqual([river!.position]);
  });

  it("finds a reachable substitute tile for an unreachable target", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const origin = firstWalkableTile(map);
    const river = map.tiles.find((tile) => tile.kind === "river");

    const substitute = nearestReachableTile(map, origin, river!.position);
    expect(substitute).toBeDefined();
    expect(isWalkableTile(map, substitute!)).toBe(true);
  });

  it("produces a large connected walkable bank region across many seeds", () => {
    SEEDS.forEach((seed) => {
      const map = generateGreatRiverSpine({ seed, width: 36, height: 28 });
      const origin = firstWalkableTile(map);
      const region = walkableRegion(map, origin);
      expect(region.size).toBeGreaterThan(map.tiles.length * 0.25);
    });
  });

  it("is deterministic across repeated generation for every sampled seed", () => {
    SEEDS.forEach((seed) => {
      const first = generateGreatRiverSpine({ seed, width: 24, height: 20 });
      const second = generateGreatRiverSpine({ seed, width: 24, height: 20 });
      expect(second).toEqual(first);
      expect(tileAt(second, { x: 5, y: 5 })).toEqual(tileAt(first, { x: 5, y: 5 }));
    });
  });

  it("produces different worlds for different seeds", () => {
    const a = generateGreatRiverSpine({ seed: 415, width: 24, height: 20 });
    const b = generateGreatRiverSpine({ seed: 416, width: 24, height: 20 });
    expect(b.tiles).not.toEqual(a.tiles);
  });
});
