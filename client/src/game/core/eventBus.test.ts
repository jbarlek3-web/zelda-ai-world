import { describe, expect, it } from "vitest";
import { EventBus } from "./eventBus";

interface TestEvents {
  readonly "hud:changed": { readonly population: number };
}

describe("EventBus", () => {
  it("delivers typed events and stops after unsubscribe", () => {
    const bus = new EventBus<TestEvents>();
    const observed: number[] = [];
    const unsubscribe = bus.on("hud:changed", ({ population }) => observed.push(population));

    bus.emit("hud:changed", { population: 8 });
    unsubscribe();
    bus.emit("hud:changed", { population: 12 });

    expect(observed).toEqual([8]);
  });
});
