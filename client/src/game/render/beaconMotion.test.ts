import { describe, expect, it } from "vitest";
import { beaconArrivalScale } from "./beaconMotion";

describe("beacon arrival motion", () => {
  it("uses anticipation, overshoot, and a settled hold without a permanent scale drift", () => {
    expect(beaconArrivalScale(0.05, false)).toBeLessThan(1);
    expect(beaconArrivalScale(0.25, false)).toBeGreaterThan(1);
    expect(beaconArrivalScale(0.9, false)).toBe(1);
  });

  it("remains static when reduced motion is requested", () => {
    expect(beaconArrivalScale(0.25, true)).toBe(1);
  });
});
