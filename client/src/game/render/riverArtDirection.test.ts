import { describe, expect, it } from "vitest";
import { generateGreatRiverSpine } from "@/game/world/greatRiverSpine";
import { deriveRiverArtDirection } from "./riverArtDirection";

describe("deriveRiverArtDirection", () => {
  it("is deterministic and stays within the configured rendering-detail budget", () => {
    const map = generateGreatRiverSpine({ seed: 72_941, width: 32, height: 24 });
    const first = deriveRiverArtDirection(map);
    const second = deriveRiverArtDirection(map);

    expect(first).toEqual(second);
    expect(first.details.length).toBeGreaterThan(0);
    expect(first.details.length).toBeLessThanOrEqual(96);
  });

  it("selects a landmark tile inside the generated map bounds", () => {
    const map = generateGreatRiverSpine({ seed: 51, width: 32, height: 24 });
    const plan = deriveRiverArtDirection(map);

    expect(plan.landmarkTile.x).toBeGreaterThanOrEqual(0);
    expect(plan.landmarkTile.x).toBeLessThan(map.width);
    expect(plan.landmarkTile.y).toBeGreaterThanOrEqual(0);
    expect(plan.landmarkTile.y).toBeLessThan(map.height);
  });
});
