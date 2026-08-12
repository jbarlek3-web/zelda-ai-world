import { BUILDING_DEFINITIONS } from "@shared/game/constants";
import type { BuildingInstance, BuildingKind, ResourceLedger, SettlementState, Vec2 } from "@shared/game/types";
import { isBuildableFootprint, type GreatRiverSpineMap } from "@/game/world/greatRiverSpine";

export type PlacementFailure = "outside-map" | "unbuildable-terrain" | "overlapping-building" | "insufficient-resources";

export type PlacementResult =
  | { readonly ok: true; readonly settlement: SettlementState; readonly building: BuildingInstance }
  | { readonly ok: false; readonly reason: PlacementFailure };

export interface PlaceBuildingCommand {
  readonly buildingId: string;
  readonly kind: BuildingKind;
  readonly position: Vec2;
  readonly rotationQuarterTurns: 0 | 1 | 2 | 3;
  readonly simulationTick: number;
}

function isFootprintOverlapping(firstOrigin: Vec2, firstSize: Vec2, secondOrigin: Vec2, secondSize: Vec2): boolean {
  return (
    firstOrigin.x < secondOrigin.x + secondSize.x &&
    firstOrigin.x + firstSize.x > secondOrigin.x &&
    firstOrigin.y < secondOrigin.y + secondSize.y &&
    firstOrigin.y + firstSize.y > secondOrigin.y
  );
}

function hasRequiredResources(storage: ResourceLedger, cost: Readonly<Partial<ResourceLedger>>): boolean {
  return Object.entries(cost).every(([resource, amount]) => storage[resource as keyof ResourceLedger] >= (amount ?? 0));
}

function deductResources(storage: ResourceLedger, cost: Readonly<Partial<ResourceLedger>>): ResourceLedger {
  return {
    wood: storage.wood - (cost.wood ?? 0),
    stone: storage.stone - (cost.stone ?? 0),
    clay: storage.clay - (cost.clay ?? 0),
    hides: storage.hides - (cost.hides ?? 0),
    fibers: storage.fibers - (cost.fibers ?? 0),
    metals: storage.metals - (cost.metals ?? 0),
    crops: storage.crops - (cost.crops ?? 0),
    fish: storage.fish - (cost.fish ?? 0),
  };
}

export function placeBuilding(map: GreatRiverSpineMap, settlement: SettlementState, command: PlaceBuildingCommand): PlacementResult {
  const definition = BUILDING_DEFINITIONS[command.kind];
  const rotatedFootprint = command.rotationQuarterTurns % 2 === 0
    ? definition.footprint
    : { x: definition.footprint.y, y: definition.footprint.x };

  if (
    command.position.x < 0 ||
    command.position.y < 0 ||
    command.position.x + rotatedFootprint.x > map.width ||
    command.position.y + rotatedFootprint.y > map.height
  ) {
    return { ok: false, reason: "outside-map" };
  }

  if (!isBuildableFootprint(map, command.position, rotatedFootprint)) {
    return { ok: false, reason: "unbuildable-terrain" };
  }

  const overlaps = settlement.buildings.some((building) => {
    const existingDefinition = BUILDING_DEFINITIONS[building.kind];
    const existingFootprint = building.rotationQuarterTurns % 2 === 0
      ? existingDefinition.footprint
      : { x: existingDefinition.footprint.y, y: existingDefinition.footprint.x };
    return isFootprintOverlapping(command.position, rotatedFootprint, building.position, existingFootprint);
  });
  if (overlaps) {
    return { ok: false, reason: "overlapping-building" };
  }

  if (!hasRequiredResources(settlement.storage, definition.constructionCost)) {
    return { ok: false, reason: "insufficient-resources" };
  }

  const building: BuildingInstance = {
    id: command.buildingId,
    kind: command.kind,
    position: command.position,
    rotationQuarterTurns: command.rotationQuarterTurns,
    constructedAtTick: command.simulationTick,
  };

  return {
    ok: true,
    building,
    settlement: {
      ...settlement,
      storage: deductResources(settlement.storage, definition.constructionCost),
      buildings: [...settlement.buildings, building],
    },
  };
}
