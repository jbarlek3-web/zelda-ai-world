import type { Vec2 } from "@shared/game/types";

import type { GatherableKind } from "@/game/features/survival/foundingQuest";
import { type GreatRiverSpineMap, tileAt } from "./greatRiverSpine";
import { hashCoordinates } from "./prng";
import { walkableRegion } from "./riverSpineReachability";

/**
 * Seeded gather-node placement.
 *
 * Resource placement is derived from the world seed rather than hardcoded, and
 * every emitted node is constrained to the walkable region that contains the
 * spawn tile, so the founding loop can never require crossing the river.
 */

export interface GatherNodePlacement {
  readonly kind: GatherableKind;
  readonly tile: Vec2;
}

export interface GatherNodePlanRequest {
  readonly map: GreatRiverSpineMap;
  readonly spawnTile: Vec2;
  readonly reedCount: number;
  readonly stoneCount: number;
}

/** Reeds favour damp ground near the water; stones favour drier open bank. */
const REED_TILE_KINDS = new Set(["shallows", "sandbar", "fertile"]);
const STONE_TILE_KINDS = new Set(["grass", "trail", "grove"]);

function candidateTiles(map: GreatRiverSpineMap, region: ReadonlySet<string>, kinds: ReadonlySet<string>): readonly Vec2[] {
  const tiles: Vec2[] = [];
  region.forEach((key) => {
    const [x, y] = key.split(":").map(Number);
    const tile = tileAt(map, { x, y });
    if (tile && kinds.has(tile.kind)) {
      tiles.push({ x, y });
    }
  });
  // Sort so the candidate order never depends on Set iteration order.
  return tiles.sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

function pickSpaced(
  candidates: readonly Vec2[],
  count: number,
  seed: number,
  salt: number,
  taken: Vec2[],
): readonly Vec2[] {
  if (candidates.length === 0 || count <= 0) return [];

  // Deterministically rank candidates, then take the highest-ranked tiles that
  // are not adjacent to an already-chosen node.
  const ranked = candidates
    .map((tile) => ({ tile, rank: hashCoordinates(seed + salt, tile.x, tile.y) }))
    .sort((a, b) => (a.rank - b.rank) || (a.tile.y - b.tile.y) || (a.tile.x - b.tile.x))
    .map((entry) => entry.tile);

  const chosen: Vec2[] = [];
  ranked.forEach((tile) => {
    if (chosen.length >= count) return;
    const tooClose = taken.some((other) => Math.abs(other.x - tile.x) + Math.abs(other.y - tile.y) < 2);
    if (tooClose) return;
    chosen.push(tile);
    taken.push(tile);
  });
  return chosen;
}

/**
 * Plan gather nodes for a generated map. Returns fewer nodes than requested only
 * when the map genuinely lacks suitable reachable ground, which callers should
 * treat as a rejected world.
 */
export function planGatherNodes(request: GatherNodePlanRequest): readonly GatherNodePlacement[] {
  const region = walkableRegion(request.map, request.spawnTile);
  const taken: Vec2[] = [];
  const reeds = pickSpaced(
    candidateTiles(request.map, region, REED_TILE_KINDS),
    request.reedCount,
    request.map.seed,
    101,
    taken,
  );
  const stones = pickSpaced(
    candidateTiles(request.map, region, STONE_TILE_KINDS),
    request.stoneCount,
    request.map.seed,
    211,
    taken,
  );

  return [
    ...reeds.map((tile): GatherNodePlacement => ({ kind: "river-reed", tile })),
    ...stones.map((tile): GatherNodePlacement => ({ kind: "smooth-stone", tile })),
  ];
}
