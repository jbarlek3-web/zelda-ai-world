import type { Vec2 } from "@shared/game/types";

export type AurastriaInputAction = "move" | "interact" | "gather" | "strike" | "roll" | "pause";

export const AURASTRIA_INPUT_BINDINGS: Readonly<Record<Exclude<AurastriaInputAction, "move">, readonly string[]>> = {
  interact: ["KeyE", "Enter"],
  gather: ["KeyF"],
  strike: ["KeyJ", "Space"],
  roll: ["KeyK", "ShiftLeft", "ShiftRight"],
  pause: ["Escape", "KeyP"],
};

export const AURASTRIA_GAMEPAD_BINDINGS: Readonly<Record<Exclude<AurastriaInputAction, "move">, readonly number[]>> = {
  interact: [0],
  gather: [2],
  strike: [1],
  roll: [3],
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

/** Mutable 2D vector used by the allocation-free input path. */
export interface MutableVec2 {
  x: number;
  y: number;
}

/**
 * Allocation-free variant of {@link combinedMoveDirection} for the render loop.
 *
 * Writes the combined, normalized direction into `target` and returns it, so a
 * steady-state movement frame creates no garbage. The pure variants above remain
 * the contract used by tests and non-hot-path callers.
 */
export function writeCombinedMoveDirection(
  target: MutableVec2,
  pressedCodes: ReadonlySet<string>,
  gamepad: Gamepad | undefined,
): MutableVec2 {
  const keyboardX = (pressedCodes.has("KeyD") || pressedCodes.has("ArrowRight") ? 1 : 0)
    - (pressedCodes.has("KeyA") || pressedCodes.has("ArrowLeft") ? 1 : 0);
  const keyboardY = (pressedCodes.has("KeyS") || pressedCodes.has("ArrowDown") ? 1 : 0)
    - (pressedCodes.has("KeyW") || pressedCodes.has("ArrowUp") ? 1 : 0);
  const keyboardLength = Math.hypot(keyboardX, keyboardY);
  const keyboardScale = keyboardLength > 1 ? 1 / keyboardLength : 1;

  const rawX = gamepad ? gamepad.axes[0] ?? 0 : 0;
  const rawY = gamepad ? gamepad.axes[1] ?? 0 : 0;
  const padX = Math.abs(rawX) >= GAMEPAD_DEAD_ZONE ? rawX : 0;
  const padY = Math.abs(rawY) >= GAMEPAD_DEAD_ZONE ? rawY : 0;
  const padLength = Math.hypot(padX, padY);
  const padScale = padLength > 1 ? 1 / padLength : 1;

  const combinedX = keyboardX * keyboardScale + padX * padScale;
  const combinedY = keyboardY * keyboardScale + padY * padScale;
  const combinedLength = Math.hypot(combinedX, combinedY);
  const combinedScale = combinedLength > 1 ? 1 / combinedLength : 1;

  target.x = combinedX * combinedScale;
  target.y = combinedY * combinedScale;
  return target;
}

export function isKeyboardAction(action: Exclude<AurastriaInputAction, "move">, code: string): boolean {
  return AURASTRIA_INPUT_BINDINGS[action].includes(code);
}

export function isGamepadActionPressed(action: Exclude<AurastriaInputAction, "move">, gamepad: Gamepad | undefined): boolean {
  return AURASTRIA_GAMEPAD_BINDINGS[action].some((buttonIndex) => Boolean(gamepad?.buttons[buttonIndex]?.pressed));
}
