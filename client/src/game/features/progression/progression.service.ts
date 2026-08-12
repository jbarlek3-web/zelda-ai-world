import type { BuildingKind, SettlementState, SettlementTier } from "@shared/game/types";

export interface SettlementTierRequirement {
  readonly nextTier: SettlementTier;
  readonly minimumPopulation: number;
  readonly minimumStoredFood: number;
  readonly requiredBuildings: readonly BuildingKind[];
}

export interface ProgressionEvaluation {
  readonly canAdvance: boolean;
  readonly nextTier: SettlementTier | null;
  readonly unmetRequirements: readonly string[];
}

const TIER_REQUIREMENTS: Readonly<Partial<Record<SettlementTier, SettlementTierRequirement>>> = {
  "founding-camp": {
    nextTier: "village",
    minimumPopulation: 12,
    minimumStoredFood: 30,
    requiredBuildings: ["longhouse", "granary", "council-house"],
  },
  village: {
    nextTier: "town",
    minimumPopulation: 30,
    minimumStoredFood: 80,
    requiredBuildings: ["longhouse", "granary", "council-house", "dock", "workshop"],
  },
  town: {
    nextTier: "city-state",
    minimumPopulation: 70,
    minimumStoredFood: 180,
    requiredBuildings: ["longhouse", "granary", "council-house", "dock", "workshop", "earth-lodge"],
  },
  "city-state": {
    nextTier: "confederation",
    minimumPopulation: 120,
    minimumStoredFood: 300,
    requiredBuildings: ["longhouse", "granary", "council-house", "dock", "workshop", "earth-lodge", "sweat-lodge"],
  },
};

export function evaluateSettlementProgression(settlement: SettlementState): ProgressionEvaluation {
  const requirement = TIER_REQUIREMENTS[settlement.tier];
  if (!requirement) {
    return { canAdvance: false, nextTier: null, unmetRequirements: [] };
  }

  const existingKinds = new Set(settlement.buildings.map((building) => building.kind));
  const storedFood = settlement.storage.crops + settlement.storage.fish;
  const unmetRequirements = [
    ...(settlement.population < requirement.minimumPopulation
      ? [`Population: ${settlement.population}/${requirement.minimumPopulation}`]
      : []),
    ...(storedFood < requirement.minimumStoredFood
      ? [`Stored food: ${storedFood}/${requirement.minimumStoredFood}`]
      : []),
    ...requirement.requiredBuildings
      .filter((buildingKind) => !existingKinds.has(buildingKind))
      .map((buildingKind) => `Construct: ${buildingKind}`),
  ];

  return {
    canAdvance: unmetRequirements.length === 0,
    nextTier: requirement.nextTier,
    unmetRequirements,
  };
}

export function advanceSettlement(settlement: SettlementState): SettlementState {
  const evaluation = evaluateSettlementProgression(settlement);
  if (!evaluation.canAdvance || !evaluation.nextTier) {
    throw new Error("Settlement advancement attempted before requirements were met");
  }

  return { ...settlement, tier: evaluation.nextTier };
}
