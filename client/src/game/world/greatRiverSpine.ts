import { DEFAULT_WORLD_SEED } from "@shared/game/constants";
import type { Vec2 } from "@shared/game/types";
import { hashCoordinates } from "./prng";

export type RiverSpineTileKind = "grass" | "fertile" | "river" | "shallows" | "sandbar" | "trail" | "grove";

export interface RiverSpineTile {
  readonly position: Vec2;
  readonly kind: RiverSpineTileKind;
  readonly elevation: number;
  readonly moisture: number;
  readonly buildable: boolean;
}

export interface GreatRiverSpineMap {
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly riverCenterColumn: number;
  readonly tiles: readonly RiverSpineTile[];
}

export interface GreatRiverSpineOptions {
  readonly seed?: number;
  readonly width?: number;
  readonly height?: number;
}

const MINIMUM_DIMENSION = 12;
const DEFAULT_WIDTH = 36;
const DEFAULT_HEIGHT = 28;

export function generateGreatRiverSpine(options: GreatRiverSpineOptions = {}): GreatRiverSpineMap {
  const seed = options.seed ?? DEFAULT_WORLD_SEED;
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;

  if (!Number.isInteger(seed) || seed < 0 || !Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error("Great River Spine generation requires non-negative integer options");
  }
  if (width < MINIMUM_DIMENSION || height < MINIMUM_DIMENSION) {
    throw new Error(`Great River Spine dimensions must be at least ${MINIMUM_DIMENSION} tiles`);
  }

  const riverCenterColumn = Math.floor(width / 2) + ((seed % 3) - 1);
  const tiles: RiverSpineTile[] = [];

  for (let y = 0; y < height; y += 1) {
    const localRiverCenter = riverCenterColumn + Math.round(Math.sin((y + seed % 11) * 0.38));
    for (let x = 0; x < width; x += 1) {
      const random = hashCoordinates(seed, x, y);
      const noise = random / 0x1_0000_0000;
      const distanceToRiver = Math.abs(x - localRiverCenter);
      const onTrail = y === Math.floor(height * 0.52) && distanceToRiver > 3 && distanceToRiver < 9;
      const isRiver = distanceToRiver <= 2;
      const isShallows = distanceToRiver === 3;
      const isSandbar = distanceToRiver === 4 && noise > 0.58;
      const isFertile = distanceToRiver >= 4 && distanceToRiver <= 8 && noise > 0.16;
      const isGrove = !isFertile && !isSandbar && !onTrail && noise > 0.86;
      const kind: RiverSpineTileKind = isRiver
        ? "river"
        : isShallows
          ? "shallows"
          : isSandbar
            ? "sandbar"
            : onTrail
              ? "trail"
              : isFertile
                ? "fertile"
                : isGrove
                  ? "grove"
                  : "grass";

      tiles.push({
        position: { x, y },
        kind,
        elevation: Number((0.16 + noise * 0.42 + Math.min(distanceToRiver, 10) * 0.018).toFixed(3)),
        moisture: Number((Math.max(0.08, 1 - distanceToRiver * 0.105) * (0.82 + noise * 0.18)).toFixed(3)),
        buildable: kind === "grass" || kind === "fertile" || kind === "trail",
      });
    }
  }

  return { seed, width, height, riverCenterColumn, tiles };
}

export function tileAt(map: GreatRiverSpineMap, position: Vec2): RiverSpineTile | undefined {
  if (position.x < 0 || position.x >= map.width || position.y < 0 || position.y >= map.height) {
    return undefined;
  }

  return map.tiles[position.y * map.width + position.x];
}

export function isBuildableFootprint(map: GreatRiverSpineMap, origin: Vec2, footprint: Vec2): boolean {
  for (let y = origin.y; y < origin.y + footprint.y; y += 1) {
    for (let x = origin.x; x < origin.x + footprint.x; x += 1) {
      if (!tileAt(map, { x, y })?.buildable) {
        return false;
      }
    }
  }

  return true;
}
