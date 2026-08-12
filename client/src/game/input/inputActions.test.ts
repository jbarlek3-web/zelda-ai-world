import { describe, expect, it } from "vitest";
import { combinedMoveDirection, isKeyboardAction, keyboardMoveDirection } from "./inputActions";

describe("Aurastria input actions", () => {
  it("normalizes diagonal keyboard movement", () => {
    const direction = keyboardMoveDirection(new Set(["KeyW", "KeyD"]));

    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
    expect(direction.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it("uses keyboard movement when no gamepad is present", () => {
    expect(combinedMoveDirection(new Set(["ArrowLeft"]), undefined)).toEqual({ x: -1, y: 0 });
  });

  it("maps discrete keyboard actions through the shared binding contract", () => {
    expect(isKeyboardAction("interact", "KeyE")).toBe(true);
    expect(isKeyboardAction("gather", "KeyE")).toBe(false);
    expect(isKeyboardAction("pause", "Escape")).toBe(true);
  });
});
