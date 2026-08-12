export type RegionId =
  | "frozen-dawn-tundra"
  | "sky-cutter-mountains"
  | "verdant-spiritwood"
  | "great-river-spine"
  | "jaguar-veil-rainforest"
  | "painted-desert-wastes"
  | "emberback-archipelago"
  | "storm-coast-archipelago";

export type ResourceKind =
  | "wood"
  | "stone"
  | "clay"
  | "hides"
  | "fibers"
  | "metals"
  | "crops"
  | "fish";

export type BuildingKind =
  | "longhouse"
  | "earth-lodge"
  | "granary"
  | "sweat-lodge"
  | "council-house"
  | "dock"
  | "workshop";

export type SettlementTier = "founding-camp" | "village" | "town" | "city-state" | "confederation";

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type ResourceCost = Readonly<Partial<Record<ResourceKind, number>>>;

export interface BuildingDefinition {
  readonly kind: BuildingKind;
  readonly displayName: string;
  readonly description: string;
  readonly constructionCost: ResourceCost;
  readonly upkeepPerSeason: ResourceCost;
  readonly footprint: Vec2;
  readonly workerCapacity: number;
  readonly ecologyImpact: "restorative" | "neutral" | "extractive";
  readonly benefits: readonly string[];
}

export interface BuildingInstance {
  readonly id: string;
  readonly kind: BuildingKind;
  readonly position: Vec2;
  readonly rotationQuarterTurns: 0 | 1 | 2 | 3;
  readonly constructedAtTick: number;
}

export type ResourceLedger = Readonly<Record<ResourceKind, number>>;

export interface SettlementState {
  readonly id: string;
  readonly name: string;
  readonly regionId: RegionId;
  readonly tier: SettlementTier;
  readonly population: number;
  readonly storage: ResourceLedger;
  readonly buildings: readonly BuildingInstance[];
}

export interface PlayerState {
  readonly id: string;
  readonly position: Vec3;
  readonly facingRadians: number;
  readonly health: number;
  readonly maxHealth: number;
  readonly resources: ResourceLedger;
}

export interface WorldState {
  readonly worldSeed: number;
  readonly simulationTick: number;
  readonly activeRegionId: RegionId;
  readonly player: PlayerState;
  readonly settlement: SettlementState;
}

export interface HudSnapshot {
  readonly regionName: string;
  readonly population: number;
  readonly settlementTier: SettlementTier;
  readonly health: number;
  readonly maxHealth: number;
  readonly resources: Readonly<Pick<ResourceLedger, "wood" | "stone" | "crops" | "fish">>;
}

export type PlayerIntent =
  | { readonly type: "move"; readonly direction: Vec2; readonly magnitude: number }
  | { readonly type: "interact" }
  | { readonly type: "open-settlement" }
  | { readonly type: "toggle-pause" };
