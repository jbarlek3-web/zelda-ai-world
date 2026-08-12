import { describe, expect, it } from "vitest";
import { createDungeonEnemy, stepDungeonEnemy } from "./dungeonEncounters";

describe("required dungeon encounters", () => {
  it.each(["Skulltula", "Moblin", "Dungeon Boss"] as const)("transitions %s through every engagement phase with one deterministic hit", (name) => {
    let enemy = createDungeonEnemy(name);
    expect(enemy.phase).toBe("idle");
    enemy = stepDungeonEnemy(enemy, { distanceToPlayer: 0.5, deltaMs: 0, playerStrike: false }).state;
    expect(enemy.phase).toBe("approach");
    enemy = stepDungeonEnemy(enemy, { distanceToPlayer: 0.5, deltaMs: 0, playerStrike: false }).state;
    expect(enemy.phase).toBe("windup");
    enemy = stepDungeonEnemy(enemy, { distanceToPlayer: 0.5, deltaMs: 1_000, playerStrike: false }).state;
    expect(enemy.phase).toBe("strike");
    const strike = stepDungeonEnemy(enemy, { distanceToPlayer: 0.5, deltaMs: 0, playerStrike: false });
    expect(strike.playerDamage).toBe(1);
    enemy = strike.state;
    expect(enemy.phase).toBe("recover");
    enemy = stepDungeonEnemy(enemy, { distanceToPlayer: 3, deltaMs: 1_000, playerStrike: false }).state;
    expect(enemy.phase).toBe("approach");
    while (enemy.phase !== "defeated") {
      enemy = stepDungeonEnemy(enemy, { distanceToPlayer: 0.5, deltaMs: 0, playerStrike: true }).state;
    }
    expect(enemy.health).toBe(0);
  });
});
