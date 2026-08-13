import { describe, expect, it } from "vitest";

import { combinedMoveDirection, writeCombinedMoveDirection } from "./inputActions";

function fakeGamepad(axisX: number, axisY: number): Gamepad {
  return { axes: [axisX, axisY], buttons: [] } as unknown as Gamepad;
}

const CASES: readonly { readonly keys: readonly string[]; readonly axes: readonly [number, number] | null }[] = [
  { keys: [], axes: null },
  { keys: ["KeyW"], axes: null },
  { keys: ["KeyW", "KeyD"], axes: null },
  { keys: ["ArrowDown", "ArrowLeft"], axes: null },
  { keys: [], axes: [0.9, -0.4] },
  { keys: [], axes: [0.1, 0.05] },
  { keys: ["KeyA"], axes: [0.8, 0.8] },
  { keys: ["KeyW", "KeyA", "KeyS", "KeyD"], axes: [0, 0] },
];

describe("writeCombinedMoveDirection", () => {
  it("matches the pure combinedMoveDirection result for every input combination", () => {
    const target = { x: 0, y: 0 };
    CASES.forEach(({ keys, axes }) => {
      const pressed = new Set(keys);
      const gamepad = axes ? fakeGamepad(axes[0], axes[1]) : undefined;
      const expected = combinedMoveDirection(pressed, gamepad);
      writeCombinedMoveDirection(target, pressed, gamepad);

      expect(target.x).toBeCloseTo(expected.x, 10);
      expect(target.y).toBeCloseTo(expected.y, 10);
    });
  });

  it("reuses the caller's object rather than allocating a new one", () => {
    const target = { x: 0, y: 0 };
    const returned = writeCombinedMoveDirection(target, new Set(["KeyW"]), undefined);

    expect(returned).toBe(target);
  });

  it("never exceeds unit length for combined keyboard and stick input", () => {
    const target = { x: 0, y: 0 };
    writeCombinedMoveDirection(target, new Set(["KeyW", "KeyD"]), fakeGamepad(1, -1));

    expect(Math.hypot(target.x, target.y)).toBeLessThanOrEqual(1 + 1e-12);
  });

  it("applies the stick dead zone", () => {
    const target = { x: 0, y: 0 };
    writeCombinedMoveDirection(target, new Set(), fakeGamepad(0.1, -0.2));

    expect(target.x).toBe(0);
    expect(target.y).toBe(0);
  });
});
