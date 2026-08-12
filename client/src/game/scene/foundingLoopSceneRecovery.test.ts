import { describe, expect, it } from "vitest";
import { deliverFoundingMaterials, settleRiverWisp } from "@/game/features/survival/foundingQuest";
import { applySettleWispSafeReturn } from "./foundingLoopSceneRecovery";

describe("founding loop scene recovery boundary", () => {
  it("teleports a defeated settle-wisp player to camp, retains the staged materials, and permits later completion", () => {
    const recovered = applySettleWispSafeReturn({
      quest: { step: "settle-wisp", inventory: { "river-reed": 3, "smooth-stone": 2 } },
      vitality: 0,
      playerPosition: { x: 14, y: 0.09, z: 4 },
    }, { x: -4, y: 0.09, z: -3 });

    expect(recovered).toMatchObject({
      vitality: 3,
      playerPosition: { x: -4, y: 0.09, z: -3 },
      quest: { step: "settle-wisp", inventory: { "river-reed": 3, "smooth-stone": 2 } },
    });
    expect(deliverFoundingMaterials(recovered.quest)).toEqual(recovered.quest);
    expect(deliverFoundingMaterials(settleRiverWisp(recovered.quest)).step).toBe("complete");
  });
});
