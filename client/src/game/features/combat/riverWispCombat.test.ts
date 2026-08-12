import { describe, expect, it } from "vitest";
import { createRiverWisp, stepRiverWisp } from "./riverWispCombat";

describe("river wisp combat", () => {
  it("walks through the deterministic approach, windup, strike, and recovery sequence", () => {
    const approaching = stepRiverWisp(createRiverWisp(), { distanceToPlayer: 4, deltaMs: 16, playerStrike: false }).state;
    const winding = stepRiverWisp(approaching, { distanceToPlayer: 1.4, deltaMs: 16, playerStrike: false }).state;
    const striking = stepRiverWisp(winding, { distanceToPlayer: 1.4, deltaMs: 430, playerStrike: false }).state;
    const hit = stepRiverWisp(striking, { distanceToPlayer: 1.4, deltaMs: 110, playerStrike: false });

    expect(approaching.phase).toBe("approach");
    expect(winding.phase).toBe("windup");
    expect(striking.phase).toBe("strike");
    expect(hit.playerDamage).toBe(1);
  });

  it("allows three in-range strikes to defeat the wisp and prevents post-defeat damage", () => {
    const first = stepRiverWisp(createRiverWisp(), { distanceToPlayer: 1, deltaMs: 0, playerStrike: true }).state;
    const second = stepRiverWisp(first, { distanceToPlayer: 1, deltaMs: 0, playerStrike: true }).state;
    const defeated = stepRiverWisp(second, { distanceToPlayer: 1, deltaMs: 0, playerStrike: true });

    expect(defeated.state).toMatchObject({ phase: "defeated", health: 0 });
    expect(stepRiverWisp(defeated.state, { distanceToPlayer: 1, deltaMs: 500, playerStrike: false }).playerDamage).toBe(0);
  });
});
