import type { Vec2 } from "@shared/game/types";
import { hashCoordinates } from "@/game/world/prng";
import type { GreatRiverSpineMap } from "@/game/world/greatRiverSpine";

export type RiverArtDetailKind = "canopy-tree" | "reed-cluster" | "river-rock";

export interface RiverArtDetail {
  readonly kind: RiverArtDetailKind;
  readonly tile: Vec2;
  readonly scale: number;
  readonly rotation: number;
}

export interface RiverArtDirectionPlan {
  readonly details: readonly RiverArtDetail[];
  readonly landmarkTile: Vec2;
}

const MAX_DETAIL_COUNT = 96;

function unitNoise(map: GreatRiverSpineMap, tile: Vec2, salt: number): number {
  return hashCoordinates(map.seed + salt, tile.x, tile.y) / 0x1_0000_0000;
}

/**
 * Produces a bounded, repeatable environment-art plan that keeps visuals separate from the world
 * simulation. It intentionally avoids runtime Math.random() so screenshots and saves stay stable.
 */
export function deriveRiverArtDirection(map: GreatRiverSpineMap): RiverArtDirectionPlan {
  const details: RiverArtDetail[] = [];
  let landmarkTile: Vec2 | undefined;

  map.tiles.forEach((tile) => {
    const placementNoise = unitNoise(map, tile.position, 31);
    const scaleNoise = unitNoise(map, tile.position, 73);
    const rotationNoise = unitNoise(map, tile.position, 107);

    if (!landmarkTile && tile.kind === "shallows" && tile.position.y >= 10 && tile.position.y <= 14) {
      landmarkTile = tile.position;
    }

    const kind: RiverArtDetailKind | null = tile.kind === "grove" && placementNoise < 0.78
      ? "canopy-tree"
      : tile.kind === "fertile" && tile.moisture > 0.42 && placementNoise < 0.095
        ? "reed-cluster"
        : tile.kind === "sandbar" && placementNoise < 0.16
          ? "river-rock"
          : null;

    if (kind && details.length < MAX_DETAIL_COUNT) {
      details.push({
        kind,
        tile: tile.position,
        scale: Number((0.72 + scaleNoise * 0.58).toFixed(3)),
        rotation: Number((rotationNoise * Math.PI * 2).toFixed(4)),
      });
    }
  });

  return {
    details,
    landmarkTile: landmarkTile ?? { x: map.riverCenterColumn - 3, y: 7 },
  };
}
