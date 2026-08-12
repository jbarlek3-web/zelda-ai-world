import type { Vec2 } from "@shared/game/types";

import { type GreatRiverSpineMap, tileAt } from "./greatRiverSpine";

/**
 * Reachability validation for generated worlds.
 *
 * Procedural output must never be handed to a player unvalidated: if the camp,
 * the Tideglass landmark, or a gather node lands behind impassable water the
 * founding loop soft-locks. These helpers flood-fill the walkable graph so a
 * caller can reject or repair a bad map before it reaches the scene.
 */

/** Tiles the explorer can walk across on foot. */
const WALKABLE_KINDS = new Set(["grass", "fertile", "trail", "grove", "sandbar", "shallows"]);

export interface ReachabilityReport {
  readonly reachableCount: number;
  readonly unreachable: readonly Vec2[];
  readonly ok: boolean;
}

export function isWalkableTile(map: GreatRiverSpineMap, position: Vec2): boolean {
  const tile = tileAt(map, position);
  return tile !== undefined && WALKABLE_KINDS.has(tile.kind);
}

function tileKey(position: Vec2): string {
  return `${position.x}:${position.y}`;
}

/** Flood-fill the walkable region containing `origin` (4-connected). */
export function walkableRegion(map: GreatRiverSpineMap, origin: Vec2): ReadonlySet<string> {
  const visited = new Set<string>();
  if (!isWalkableTile(map, origin)) {
    return visited;
  }

  const queue: Vec2[] = [origin];
  visited.add(tileKey(origin));
  while (queue.length > 0) {
    const current = queue.shift() as Vec2;
    const neighbors: readonly Vec2[] = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];
    neighbors.forEach((neighbor) => {
      const key = tileKey(neighbor);
      if (visited.has(key) || !isWalkableTile(map, neighbor)) return;
      visited.add(key);
      queue.push(neighbor);
    });
  }

  return visited;
}

/**
 * Verify every required objective tile shares one walkable region with `origin`.
 * Returns the tiles that failed so a generator can reseed rather than ship a
 * soft-locked world.
 */
export function validateObjectiveReachability(
  map: GreatRiverSpineMap,
  origin: Vec2,
  objectives: readonly Vec2[],
): ReachabilityReport {
  const region = walkableRegion(map, origin);
  const unreachable = objectives.filter((objective) => !region.has(tileKey(objective)));
  return { reachableCount: region.size, unreachable, ok: region.size > 0 && unreachable.length === 0 };
}

/** Nearest walkable tile to `target` within the region containing `origin`. */
export function nearestReachableTile(map: GreatRiverSpineMap, origin: Vec2, target: Vec2): Vec2 | undefined {
  const region = walkableRegion(map, origin);
  let best: Vec2 | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  region.forEach((key) => {
    const [x, y] = key.split(":").map(Number);
    const distance = Math.abs(x - target.x) + Math.abs(y - target.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { x, y };
    }
  });
  return best;
}
