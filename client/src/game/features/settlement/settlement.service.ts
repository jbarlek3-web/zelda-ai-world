import type { ResourceLedger, SettlementState } from "@shared/game/types";

export interface SeasonalSettlementOutcome {
  readonly settlement: SettlementState;
  readonly foodRequired: number;
  readonly foodConsumed: number;
  readonly foodShortfall: number;
  readonly production: Readonly<Pick<ResourceLedger, "crops" | "fish" | "fibers">>;
  readonly explanations: readonly string[];
}

function hasBuilding(settlement: SettlementState, kind: SettlementState["buildings"][number]["kind"]): boolean {
  return settlement.buildings.some((building) => building.kind === kind);
}

function takeFood(storage: ResourceLedger, amount: number): { readonly storage: ResourceLedger; readonly consumed: number } {
  const cropsConsumed = Math.min(storage.crops, amount);
  const remainingNeed = amount - cropsConsumed;
  const fishConsumed = Math.min(storage.fish, remainingNeed);

  return {
    consumed: cropsConsumed + fishConsumed,
    storage: {
      ...storage,
      crops: storage.crops - cropsConsumed,
      fish: storage.fish - fishConsumed,
    },
  };
}

/**
 * Advances only the settlement economy. Weather and politics will be separate deterministic services,
 * keeping the seasonal balance rule independently testable and auditable.
 */
export function advanceSettlementSeason(settlement: SettlementState): SeasonalSettlementOutcome {
  const hasGranary = hasBuilding(settlement, "granary");
  const hasDock = hasBuilding(settlement, "dock");
  const hasWorkshop = hasBuilding(settlement, "workshop");
  const foodRequired = Math.max(1, Math.ceil(settlement.population / 3));
  const production = {
    crops: 2 + (hasGranary ? 3 : 0),
    fish: 1 + (hasDock ? 4 : 0),
    fibers: hasWorkshop ? 1 : 0,
  };
  const stockedStorage: ResourceLedger = {
    ...settlement.storage,
    crops: settlement.storage.crops + production.crops,
    fish: settlement.storage.fish + production.fish,
    fibers: settlement.storage.fibers + production.fibers,
  };
  const foodResult = takeFood(stockedStorage, foodRequired);
  const explanations = [
    `Seasonal food need: ${foodRequired}.`,
    `Harvest and fishing provided ${production.crops + production.fish} food.`,
    ...(hasGranary ? ["The granary reduced seasonal loss and protected the crop reserve."] : []),
    ...(hasDock ? ["The canoe dock expanded access to river fishing."] : []),
    ...(hasWorkshop ? ["The workshop produced one unit of fiber goods for repair and trade."] : []),
    ...(foodResult.consumed < foodRequired ? ["The settlement has a food shortfall; seek trade, gathering, or a council response."] : []),
  ];

  return {
    settlement: { ...settlement, storage: foodResult.storage },
    foodRequired,
    foodConsumed: foodResult.consumed,
    foodShortfall: foodRequired - foodResult.consumed,
    production,
    explanations,
  };
}
