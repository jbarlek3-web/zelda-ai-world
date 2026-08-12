export type GatherableKind = "river-reed" | "smooth-stone";
export type FoundingQuestStep = "seek-beacon" | "gather-materials" | "return-to-camp" | "complete";
export type FoundingInventory = Readonly<Record<GatherableKind, number>>;

export interface FoundingQuestState {
  readonly step: FoundingQuestStep;
  readonly inventory: FoundingInventory;
}

export const FOUNDING_QUEST_TARGETS = {
  riverReeds: 3,
  smoothStones: 2,
} as const;

export function createFoundingQuest(): FoundingQuestState {
  return { step: "seek-beacon", inventory: { "river-reed": 0, "smooth-stone": 0 } };
}

export function attuneTideglass(state: FoundingQuestState): FoundingQuestState {
  return state.step === "seek-beacon" ? { ...state, step: "gather-materials" } : state;
}

export function collectFoundingMaterial(state: FoundingQuestState, kind: GatherableKind): FoundingQuestState {
  if (state.step !== "gather-materials") {
    return state;
  }

  const nextInventory = {
    ...state.inventory,
    [kind]: Math.min(
      kind === "river-reed" ? FOUNDING_QUEST_TARGETS.riverReeds : FOUNDING_QUEST_TARGETS.smoothStones,
      state.inventory[kind] + 1,
    ),
  };
  const next = { ...state, inventory: nextInventory };
  const readyToReturn = next.inventory["river-reed"] >= FOUNDING_QUEST_TARGETS.riverReeds
    && next.inventory["smooth-stone"] >= FOUNDING_QUEST_TARGETS.smoothStones;
  return readyToReturn ? { ...next, step: "return-to-camp" } : next;
}

export function deliverFoundingMaterials(state: FoundingQuestState): FoundingQuestState {
  return state.step === "return-to-camp" ? { ...state, step: "complete" } : state;
}

export function foundingObjective(state: FoundingQuestState): string {
  switch (state.step) {
    case "seek-beacon":
      return "Seek the Tideglass Beacon";
    case "gather-materials":
      return "Gather river materials for the camp";
    case "return-to-camp":
      return "Return the gathered materials to Founding Camp";
    case "complete":
      return "Founding need met: Granary plans secured";
  }
}

export function foundingProgress(state: FoundingQuestState): string {
  return `${state.inventory["river-reed"]}/${FOUNDING_QUEST_TARGETS.riverReeds} reeds · ${state.inventory["smooth-stone"]}/${FOUNDING_QUEST_TARGETS.smoothStones} stones`;
}
