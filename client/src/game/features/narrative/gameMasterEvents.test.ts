import { describe, expect, it } from "vitest";
import { gameMasterMomentForStatus } from "./gameMasterEvents";

describe("Game Master status mapping", () => {
  it("maps each meaningful founding event, including the no-soft-lock safe return", () => {
    expect(gameMasterMomentForStatus("Tideglass patterns resolve into a camp need.")).toBe("camp-interaction");
    expect(gameMasterMomentForStatus("Collected river reed.")).toBe("camp-interaction");
    expect(gameMasterMomentForStatus("River wisp settled.")).toBe("camp-interaction");
    expect(gameMasterMomentForStatus("The river carries you safely back to camp. No journey progress was lost.")).toBe("camp-interaction");
    expect(gameMasterMomentForStatus("Founding need met.")).toBe("settlement-advance");
  });
});
