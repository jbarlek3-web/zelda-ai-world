import type { FoundingQuestState } from "./foundingQuest";

export interface WispRecoveryResult {
  readonly quest: FoundingQuestState;
  readonly vitality: number;
  readonly returnToCamp: boolean;
}

export function recoverFromRiverWisp(quest: FoundingQuestState): WispRecoveryResult {
  return {
    quest,
    vitality: 3,
    returnToCamp: quest.step === "settle-wisp",
  };
}
