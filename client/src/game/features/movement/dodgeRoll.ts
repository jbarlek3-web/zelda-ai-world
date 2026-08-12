import type { Vec2 } from "@shared/game/types";

/**
 * Deterministic dodge-roll rules.
 *
 * All roll behaviour is expressed as pure functions over explicit inputs so the
 * mechanic can be unit-tested without a Babylon scene, a real clock, or input
 * devices. The scene layer owns meshes and timers; this module owns the rules.
 */

export const ROLL_DISTANCE_WORLD_UNITS = 2.15;
export const ROLL_COOLDOWN_MS = 650;

export type RollRejection = "cooldown" | "no-direction";

export interface RollBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export interface RollOrigin {
  readonly x: number;
  readonly z: number;
}

export interface RollRequest {
  readonly origin: RollOrigin;
  readonly direction: Vec2;
  readonly bounds: RollBounds;
  readonly nowMs: number;
  readonly cooldownEndsAtMs: number;
}

export interface RollAccepted {
  readonly ok: true;
  readonly position: RollOrigin;
  /** Facing angle in radians, matching the scene's `atan2(x, z)` convention. */
  readonly headingRadians: number;
  readonly cooldownEndsAtMs: number;
}

export interface RollRejected {
  readonly ok: false;
  readonly reason: RollRejection;
}

export type RollResult = RollAccepted | RollRejected;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isRollReady(nowMs: number, cooldownEndsAtMs: number): boolean {
  return nowMs >= cooldownEndsAtMs;
}

/**
 * Resolve a roll attempt. Returns the clamped destination and the next cooldown
 * deadline, or an explicit rejection reason the caller can narrate.
 */
export function resolveRoll(request: RollRequest): RollResult {
  if (!isRollReady(request.nowMs, request.cooldownEndsAtMs)) {
    return { ok: false, reason: "cooldown" };
  }

  const length = Math.hypot(request.direction.x, request.direction.y);
  if (length === 0) {
    return { ok: false, reason: "no-direction" };
  }

  const unitX = request.direction.x / length;
  const unitZ = request.direction.y / length;
  return {
    ok: true,
    position: {
      x: clamp(request.origin.x + unitX * ROLL_DISTANCE_WORLD_UNITS, request.bounds.minX, request.bounds.maxX),
      z: clamp(request.origin.z + unitZ * ROLL_DISTANCE_WORLD_UNITS, request.bounds.minZ, request.bounds.maxZ),
    },
    headingRadians: Math.atan2(unitX, unitZ),
    cooldownEndsAtMs: request.nowMs + ROLL_COOLDOWN_MS,
  };
}

export function rollRejectionMessage(reason: RollRejection): string {
  return reason === "cooldown"
    ? "Your footing is still recovering. Wait a breath before rolling again."
    : "Choose a direction before rolling.";
}
