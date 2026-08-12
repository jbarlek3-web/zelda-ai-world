import type { Vec2 } from "@shared/game/types";

import { type GatherNodePlacement, planGatherNodes } from "./gatherNodePlan";
import { generateGreatRiverSpine, type GreatRiverSpineMap } from "./greatRiverSpine";
import { deriveRiverArtDirection } from "@/game/render/riverArtDirection";
import { nearestReachableTile, validateObjectiveReachability } from "./riverSpineReachability";

/**
 * Founding-loop world layout.
 *
 * Resolves the single authoritative set of tiles the scene must render: spawn,
 * Tideglass beacon, founding camp, and gather nodes. The tiles returned here are
 * the tiles that were validated — the scene must not substitute its own — so a
 * soft-locked world can never reach the player.
 */

export interface FoundingLoopLayoutRequest {
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly spawnTile: Vec2;
  readonly preferredCampTile: Vec2;
  readonly reedCount: number;
  readonly stoneCount: number;
}

export interface FoundingLoopLayout {
  readonly map: GreatRiverSpineMap;
  readonly spawnTile: Vec2;
  readonly beaconTile: Vec2;
  readonly campTile: Vec2;
  readonly gatherPlacements: readonly GatherNodePlacement[];
}

export class UnplayableWorldError extends Error {
  constructor(readonly seed: number, readonly detail: string) {
    super(`Great River Spine seed ${seed} produced an unplayable founding loop: ${detail}`);
    this.name = "UnplayableWorldError";
  }
}

export function resolveFoundingLoopLayout(request: FoundingLoopLayoutRequest): FoundingLoopLayout {
  const map = generateGreatRiverSpine({ seed: request.seed, width: request.width, height: request.height });
  const beaconTile = nearestReachableTile(map, request.spawnTile, deriveRiverArtDirection(map).landmarkTile);
  const campTile = nearestReachableTile(map, request.spawnTile, request.preferredCampTile);
  if (!beaconTile || !campTile) {
    throw new UnplayableWorldError(map.seed, "no reachable Tideglass or camp tile exists from the spawn tile");
  }

  const gatherPlacements = planGatherNodes({
    map,
    spawnTile: request.spawnTile,
    reedCount: request.reedCount,
    stoneCount: request.stoneCount,
  });
  const requiredNodes = request.reedCount + request.stoneCount;
  if (gatherPlacements.length < requiredNodes) {
    throw new UnplayableWorldError(
      map.seed,
      `only ${gatherPlacements.length} of ${requiredNodes} gather nodes could be placed on reachable ground`,
    );
  }

  const reachability = validateObjectiveReachability(map, request.spawnTile, [
    beaconTile,
    campTile,
    ...gatherPlacements.map((placement) => placement.tile),
  ]);
  if (!reachability.ok) {
    throw new UnplayableWorldError(
      map.seed,
      `${reachability.unreachable.length} founding-loop objectives are unreachable from the spawn tile`,
    );
  }

  return { map, spawnTile: request.spawnTile, beaconTile, campTile, gatherPlacements };
}
