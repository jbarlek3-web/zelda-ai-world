import { describe, expect, it } from "vitest";

import {
  ROLL_COOLDOWN_MS,
  ROLL_DISTANCE_WORLD_UNITS,
  isRollReady,
  resolveRoll,
  rollRejectionMessage,
} from "./dodgeRoll";

const BOUNDS = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 } as const;

describe("dodgeRoll", () => {
  it("moves the explorer a fixed distance along the input direction", () => {
    const result = resolveRoll({
      origin: { x: 0, z: 0 },
      direction: { x: 0, y: 1 },
      bounds: BOUNDS,
      nowMs: 1_000,
      cooldownEndsAtMs: 0,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.position.x).toBeCloseTo(0, 6);
    expect(result.position.z).toBeCloseTo(ROLL_DISTANCE_WORLD_UNITS, 6);
    expect(result.cooldownEndsAtMs).toBe(1_000 + ROLL_COOLDOWN_MS);
  });

  it("normalizes diagonal input so diagonal rolls are not longer", () => {
    const result = resolveRoll({
      origin: { x: 0, z: 0 },
      direction: { x: 1, y: 1 },
      bounds: BOUNDS,
      nowMs: 0,
      cooldownEndsAtMs: 0,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Math.hypot(result.position.x, result.position.z)).toBeCloseTo(ROLL_DISTANCE_WORLD_UNITS, 6);
  });

  it("clamps the destination to the world bounds instead of leaving the map", () => {
    const result = resolveRoll({
      origin: { x: 9.5, z: -9.7 },
      direction: { x: 1, y: -1 },
      bounds: BOUNDS,
      nowMs: 0,
      cooldownEndsAtMs: 0,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.position.x).toBe(BOUNDS.maxX);
    expect(result.position.z).toBe(BOUNDS.minZ);
  });

  it("rejects a roll that is still on cooldown", () => {
    const result = resolveRoll({
      origin: { x: 0, z: 0 },
      direction: { x: 0, y: 1 },
      bounds: BOUNDS,
      nowMs: 500,
      cooldownEndsAtMs: 900,
    });

    expect(result).toEqual({ ok: false, reason: "cooldown" });
    expect(rollRejectionMessage("cooldown")).toMatch(/recovering/i);
  });

  it("rejects a roll with no movement input", () => {
    const result = resolveRoll({
      origin: { x: 1, z: 2 },
      direction: { x: 0, y: 0 },
      bounds: BOUNDS,
      nowMs: 5_000,
      cooldownEndsAtMs: 0,
    });

    expect(result).toEqual({ ok: false, reason: "no-direction" });
    expect(rollRejectionMessage("no-direction")).toMatch(/direction/i);
  });

  it("becomes ready again exactly at the cooldown deadline", () => {
    expect(isRollReady(649, 650)).toBe(false);
    expect(isRollReady(650, 650)).toBe(true);
  });

  it("is deterministic for identical requests", () => {
    const request = {
      origin: { x: -3.25, z: 4.5 },
      direction: { x: -0.6, y: 0.8 },
      bounds: BOUNDS,
      nowMs: 12_345,
      cooldownEndsAtMs: 0,
    } as const;

    expect(resolveRoll(request)).toEqual(resolveRoll(request));
  });
});
