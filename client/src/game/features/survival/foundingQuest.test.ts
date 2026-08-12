import { describe, expect, it } from "vitest";
import {
  attuneTideglass,
  collectFoundingMaterial,
  createFoundingQuest,
  deliverFoundingMaterials,
} from "./foundingQuest";

describe("founding quest", () => {
  it("moves from beacon discovery through gathering to camp delivery", () => {
    let quest = attuneTideglass(createFoundingQuest());
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "river-reed");
    quest = collectFoundingMaterial(quest, "smooth-stone");
    quest = collectFoundingMaterial(quest, "smooth-stone");

    expect(quest.step).toBe("return-to-camp");
    expect(quest.inventory).toEqual({ "river-reed": 3, "smooth-stone": 2 });
    expect(deliverFoundingMaterials(quest).step).toBe("complete");
  });

  it("does not gather materials before the beacon has been attuned", () => {
    expect(collectFoundingMaterial(createFoundingQuest(), "river-reed")).toEqual(createFoundingQuest());
  });
});
