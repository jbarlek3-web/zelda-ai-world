import { describe, expect, it } from "vitest";
import { generateGreatRiverSpine, tileAt } from "./greatRiverSpine";

describe("generateGreatRiverSpine", () => {
  it("creates an identical world for a fixed seed", () => {
    const first = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const second = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });

    expect(second).toEqual(first);
  });

  it("creates a traversable river with buildable banks", () => {
    const map = generateGreatRiverSpine({ seed: 415, width: 20, height: 16 });
    const riverTiles = map.tiles.filter((tile) => tile.kind === "river");
    const buildableTiles = map.tiles.filter((tile) => tile.buildable);

    expect(riverTiles).toHaveLength(80);
    expect(buildableTiles.length).toBeGreaterThan(map.tiles.length / 2);
    expect(tileAt(map, { x: -1, y: 0 })).toBeUndefined();
  });
});
