import { describe, expect, it } from "vitest";
import { deliverFoundingMaterials, settleRiverWisp, type FoundingQuestState } from "./foundingQuest";
import { recoverFromRiverWisp } from "./foundingLoopRecovery";

describe("founding loop wisp recovery", () => {
  it("returns the player safely without losing combat-gated materials and permits later completion", () => {
    const stagedQuest: FoundingQuestState = {
      step: "settle-wisp",
      inventory: { "river-reed": 3, "smooth-stone": 2 },
    };
    const recovery = recoverFromRiverWisp(stagedQuest);

    expect(recovery).toMatchObject({ vitality: 3, returnToCamp: true, quest: stagedQuest });
    expect(deliverFoundingMaterials(recovery.quest)).toEqual(recovery.quest);
    expect(deliverFoundingMaterials(settleRiverWisp(recovery.quest)).step).toBe("complete");
  });
});
