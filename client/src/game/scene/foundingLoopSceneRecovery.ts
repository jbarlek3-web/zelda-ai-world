import type { FoundingQuestState } from "@/game/features/survival/foundingQuest";

export interface FoundingSceneRecoveryState {
  readonly quest: FoundingQuestState;
  readonly vitality: number;
  readonly playerPosition: Readonly<{ x: number; y: number; z: number }>;
}

export function applySettleWispSafeReturn(
  state: FoundingSceneRecoveryState,
  campPosition: Readonly<{ x: number; y: number; z: number }>,
): FoundingSceneRecoveryState {
  if (state.quest.step !== "settle-wisp") return state;
  return { ...state, vitality: 3, playerPosition: { ...campPosition } };
}
