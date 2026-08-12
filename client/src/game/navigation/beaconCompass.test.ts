import { describe, expect, it } from "vitest";
import { beaconNavigation } from "./beaconCompass";

describe("beaconNavigation", () => {
  it("uses clockwise bearings from world north", () => {
    expect(beaconNavigation({ x: 0, z: 0 }, { x: 0, z: 8 })).toEqual({ bearingDegrees: 0, distance: 8 });
    expect(beaconNavigation({ x: 0, z: 0 }, { x: 6, z: 0 })).toEqual({ bearingDegrees: 90, distance: 6 });
  });

  it("rounds diagonal distance and normalizes western bearings", () => {
    expect(beaconNavigation({ x: 0, z: 0 }, { x: -3, z: -4 })).toEqual({ bearingDegrees: 217, distance: 5 });
  });
});
