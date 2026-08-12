import { describe, expect, it } from "vitest";
import { decideNpcAction } from "./npc.behavior";

describe("decideNpcAction", () => {
  it("lets a danger branch interrupt lower-priority needs and work", () => {
    const decision = decideNpcAction({
      threatLevel: 80,
      hungerLevel: 100,
      fatigueLevel: 100,
      playerRequestedHelp: true,
      assignedWorkAvailable: true,
    });

    expect(decision.action).toBe("signal-danger");
    expect(decision.behaviorPath).toContain("Danger sequence");
  });

  it("chooses the work branch when no higher-priority state is active", () => {
    expect(decideNpcAction({
      threatLevel: 0,
      hungerLevel: 0,
      fatigueLevel: 0,
      playerRequestedHelp: false,
      assignedWorkAvailable: true,
    }).action).toBe("work");
  });
});
