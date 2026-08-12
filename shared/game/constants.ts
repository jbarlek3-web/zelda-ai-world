import type { BuildingDefinition, BuildingKind, RegionId, ResourceLedger, Vec3 } from "./types";

export const GAME_TITLE = "Aurastria: Spirits of the First Dawn";
export const GAME_VERSION = 1;
export const DEFAULT_WORLD_SEED = 20260812;
export const SIMULATION_TICKS_PER_SECOND = 10;
export const TILE_SIZE = 2;
export const PLAYER_SPAWN: Vec3 = { x: 0, y: 0.5, z: 3 };

export const REGION_DISPLAY_NAMES: Readonly<Record<RegionId, string>> = {
  "frozen-dawn-tundra": "Frozen Dawn Tundra",
  "sky-cutter-mountains": "Sky-Cutter Mountains",
  "verdant-spiritwood": "Verdant Spiritwood",
  "great-river-spine": "Great River Spine",
  "jaguar-veil-rainforest": "Jaguar-Veil Rainforest",
  "painted-desert-wastes": "Painted Desert Wastes",
  "emberback-archipelago": "Emberback Archipelago",
  "storm-coast-archipelago": "Storm-Coast Archipelago",
};

export const EMPTY_RESOURCES: ResourceLedger = {
  wood: 0,
  stone: 0,
  clay: 0,
  hides: 0,
  fibers: 0,
  metals: 0,
  crops: 0,
  fish: 0,
};

export const STARTING_RESOURCES: ResourceLedger = {
  wood: 48,
  stone: 20,
  clay: 16,
  hides: 8,
  fibers: 18,
  metals: 0,
  crops: 24,
  fish: 14,
};

export const BUILDING_DEFINITIONS: Readonly<Record<BuildingKind, BuildingDefinition>> = {
  longhouse: {
    kind: "longhouse",
    displayName: "Longhouse",
    description: "A shared home that anchors families and increases settlement resilience.",
    constructionCost: { wood: 24, fibers: 10 },
    upkeepPerSeason: { wood: 1 },
    footprint: { x: 3, y: 2 },
    workerCapacity: 0,
    ecologyImpact: "neutral",
    benefits: ["Increases housing", "Improves community resilience"],
  },
  "earth-lodge": {
    kind: "earth-lodge",
    displayName: "Earth Lodge",
    description: "An insulated dwelling suited to difficult weather and seasonal shelter.",
    constructionCost: { wood: 12, clay: 18, fibers: 8 },
    upkeepPerSeason: { wood: 1 },
    footprint: { x: 2, y: 2 },
    workerCapacity: 0,
    ecologyImpact: "neutral",
    benefits: ["Improves winter shelter", "Reduces weather stress"],
  },
  granary: {
    kind: "granary",
    displayName: "Granary",
    description: "Protected food storage that reduces spoilage and stabilizes lean seasons.",
    constructionCost: { wood: 16, stone: 6, fibers: 6 },
    upkeepPerSeason: { wood: 1 },
    footprint: { x: 2, y: 2 },
    workerCapacity: 1,
    ecologyImpact: "restorative",
    benefits: ["Stores crops", "Reduces spoilage"],
  },
  "sweat-lodge": {
    kind: "sweat-lodge",
    displayName: "Restoration Lodge",
    description: "A fictional community restoration space for rest, recovery, and social care.",
    constructionCost: { stone: 10, wood: 8, clay: 8 },
    upkeepPerSeason: { wood: 2 },
    footprint: { x: 2, y: 2 },
    workerCapacity: 1,
    ecologyImpact: "neutral",
    benefits: ["Restores morale", "Supports recovery"],
  },
  "council-house": {
    kind: "council-house",
    displayName: "Council House",
    description: "A civic gathering place for agreements, disputes, and shared decisions.",
    constructionCost: { wood: 26, stone: 10, fibers: 8 },
    upkeepPerSeason: { wood: 1 },
    footprint: { x: 3, y: 3 },
    workerCapacity: 2,
    ecologyImpact: "neutral",
    benefits: ["Unlocks civic decisions", "Improves relationship repair"],
  },
  dock: {
    kind: "dock",
    displayName: "Canoe Dock",
    description: "A river landing that connects fishing, travel, and regional trade.",
    constructionCost: { wood: 20, stone: 8, fibers: 6 },
    upkeepPerSeason: { wood: 2 },
    footprint: { x: 3, y: 1 },
    workerCapacity: 2,
    ecologyImpact: "neutral",
    benefits: ["Enables river trade", "Supports fishing"],
  },
  workshop: {
    kind: "workshop",
    displayName: "Workshop",
    description: "A practical craft space for tools, repair, and durable trade goods.",
    constructionCost: { wood: 18, stone: 10, clay: 8 },
    upkeepPerSeason: { wood: 1 },
    footprint: { x: 2, y: 2 },
    workerCapacity: 3,
    ecologyImpact: "neutral",
    benefits: ["Crafts tools", "Expands trade options"],
  },
};
