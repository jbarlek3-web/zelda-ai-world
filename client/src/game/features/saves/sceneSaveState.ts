import type { SaveStateInput } from "@shared/game/schemas";
import {
  attuneTideglass,
  collectFoundingMaterial,
  createFoundingQuest,
  deliverFoundingMaterials,
  settleRiverWisp,
  type FoundingQuestState,
} from "../survival/foundingQuest";

export interface SceneSaveSource {
  readonly worldSeed: number;
  readonly playerPosition: Readonly<{ x: number; y: number; z: number }>;
  readonly quest: FoundingQuestState;
}

function completedQuestIds(quest: FoundingQuestState): string[] {
  if (quest.step === "complete") {
    return ["tideglass-attuned", "river-wisp-settled", "founding-need"];
  }
  if (quest.step === "return-to-camp") {
    return ["tideglass-attuned", "river-wisp-settled"];
  }
  return quest.step === "seek-beacon" ? [] : ["tideglass-attuned"];
}

export function createSceneSaveState(source: SceneSaveSource): SaveStateInput {
  return {
    version: 1,
    worldSeed: source.worldSeed,
    regionId: "great-river-spine",
    playerPosition: source.playerPosition,
    resources: {
      wood: 0,
      stone: source.quest.inventory["smooth-stone"],
      clay: 0,
      hides: 0,
      fibers: source.quest.inventory["river-reed"],
      metals: 0,
      crops: 0,
      fish: 0,
    },
    completedQuestIds: completedQuestIds(source.quest),
  };
}

export function restoreFoundingQuest(state: SaveStateInput): FoundingQuestState {
  let quest = createFoundingQuest();
  const shouldRestoreMaterials = state.completedQuestIds.includes("tideglass-attuned")
    || state.resources.fibers > 0
    || state.resources.stone > 0;
  if (!shouldRestoreMaterials) {
    return quest;
  }

  quest = attuneTideglass(quest);
  for (let index = 0; index < state.resources.fibers; index += 1) {
    quest = collectFoundingMaterial(quest, "river-reed");
  }
  for (let index = 0; index < state.resources.stone; index += 1) {
    quest = collectFoundingMaterial(quest, "smooth-stone");
  }
  if (state.completedQuestIds.includes("river-wisp-settled")) {
    quest = settleRiverWisp(quest);
  }
  return state.completedQuestIds.includes("founding-need") ? deliverFoundingMaterials(quest) : quest;
}
