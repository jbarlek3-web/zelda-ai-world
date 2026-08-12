import { describe, expect, it } from "vitest";
import {
  attuneTideglass,
  collectFoundingMaterial,
  createFoundingQuest,
  deliverFoundingMaterials,
  settleRiverWisp,
} from "./foundingQuest";

describe("founding quest", () => {
  it("moves from beacon discovery through gathering to camp delivery", () => {
    let quest = attuneTideglass(createFoundingQuest());
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "smooth-stone");
    quest = collectFoundingMaterial(quest, "smooth-stone");

    expect(quest.step).toBe("settle-wisp");
    expect(quest.inventory).toEqual({ "river-reed": 3, "smooth-stone": 2 });
    expect(deliverFoundingMaterials(quest)).toEqual(quest);
    quest = settleRiverWisp(quest);
    expect(quest.step).toBe("return-to-camp");
    expect(deliverFoundingMaterials(quest).step).toBe("complete");
  });

  it("does not gather materials before the beacon has been attuned", () => {
    expect(collectFoundingMaterial(createFoundingQuest(), "river-reed")).toEqual(createFoundingQuest());
  });

  it("keeps wisp settlement and camp delivery idempotent after their reward transitions", () => {
    const complete = deliverFoundingMaterials(settleRiverWisp({
      step: "settle-wisp",
      inventory: { "river-reed": 3, "smooth-stone": 2 },
    }));
    expect(settleRiverWisp(complete)).toEqual(complete);
    expect(deliverFoundingMaterials(complete)).toEqual(complete);
  });

  it("keeps a completed camp interaction stable after the founding reward is already recorded", () => {
    const complete = {
      step: "complete" as const,
      inventory: { "river-reed": 3, "smooth-stone": 2 },
    };
    expect(deliverFoundingMaterials(complete)).toEqual(complete);
  });
});
