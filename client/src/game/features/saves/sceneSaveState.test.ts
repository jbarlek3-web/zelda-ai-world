import { describe, expect, it } from "vitest";
import { attuneTideglass, collectFoundingMaterial, createFoundingQuest, deliverFoundingMaterials, settleRiverWisp } from "../survival/foundingQuest";
import { createSceneSaveState, restoreFoundingQuest } from "./sceneSaveState";

describe("scene save state", () => {
  it("round-trips player position and the completed founding objective through the versioned save contract", () => {
    let quest = attuneTideglass(createFoundingQuest());
    ["river-reed", "river-reed", "river-reed", "smooth-stone", "smooth-stone"].forEach((kind) => {
      quest = collectFoundingMaterial(quest, kind as "river-reed" | "smooth-stone");
    });
    quest = settleRiverWisp(quest);
    quest = deliverFoundingMaterials(quest);

    const saved = createSceneSaveState({ worldSeed: 42, playerPosition: { x: 2, y: 0.72, z: -3 }, quest });
    expect(saved).toMatchObject({ regionId: "great-river-spine", completedQuestIds: ["tideglass-attuned", "river-wisp-settled", "founding-need"] });
    expect(restoreFoundingQuest(saved)).toEqual(quest);
  });
});
