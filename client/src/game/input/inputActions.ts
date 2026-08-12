import type { Vec2 } from "@shared/game/types";

export type AurastriaInputAction = "move" | "interact" | "gather" | "pause";

export const AURASTRIA_INPUT_BINDINGS: Readonly<Record<Exclude<AurastriaInputAction, "move">, readonly string[]>> = {
  interact: ["KeyE", "Enter"],
  gather: ["KeyF"],
  pause: ["Escape", "KeyP"],
};

export const AURASTRIA_GAMEPAD_BINDINGS: Readonly<Record<Exclude<AurastriaInputAction, "move">, readonly number[]>> = {
  interact: [0],
  gather: [2],
  pause: [9],
};

const GAMEPAD_DEAD_ZONE = 0.22;

function normalizeDirection(direction: Vec2): Vec2 {
  const length = Math.hypot(direction.x, direction.y);
  return length > 1 ? { x: direction.x / length, y: direction.y / length } : direction;
}

export function keyboardMoveDirection(pressedCodes: ReadonlySet<string>): Vec2 {
  const horizontal = (pressedCodes.has("KeyD") || pressedCodes.has("ArrowRight") ? 1 : 0)
    - (pressedCodes.has("KeyA") || pressedCodes.has("ArrowLeft") ? 1 : 0);
  const vertical = (pressedCodes.has("KeyS") || pressedCodes.has("ArrowDown") ? 1 : 0)
    - (pressedCodes.has("KeyW") || pressedCodes.has("ArrowUp") ? 1 : 0);
  return normalizeDirection({ x: horizontal, y: vertical });
}

export function gamepadMoveDirection(gamepad: Gamepad | undefined): Vec2 {
  if (!gamepad) {
    return { x: 0, y: 0 };
  }

  const horizontal = Math.abs(gamepad.axes[0] ?? 0) >= GAMEPAD_DEAD_ZONE ? (gamepad.axes[0] ?? 0) : 0;
  const vertical = Math.abs(gamepad.axes[1] ?? 0) >= GAMEPAD_DEAD_ZONE ? (gamepad.axes[1] ?? 0) : 0;
  return normalizeDirection({ x: horizontal, y: vertical });
}

export function combinedMoveDirection(pressedCodes: ReadonlySet<string>, gamepad: Gamepad | undefined): Vec2 {
  const keyboard = keyboardMoveDirection(pressedCodes);
  const controller = gamepadMoveDirection(gamepad);
  return normalizeDirection({ x: keyboard.x + controller.x, y: keyboard.y + controller.y });
}

export function isKeyboardAction(action: Exclude<AurastriaInputAction, "move">, code: string): boolean {
  return AURASTRIA_INPUT_BINDINGS[action].includes(code);
}

export function isGamepadActionPressed(action: Exclude<AurastriaInputAction, "move">, gamepad: Gamepad | undefined): boolean {
  return AURASTRIA_GAMEPAD_BINDINGS[action].some((buttonIndex) => Boolean(gamepad?.buttons[buttonIndex]?.pressed));
}
