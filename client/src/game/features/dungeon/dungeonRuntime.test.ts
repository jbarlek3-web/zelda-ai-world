import { describe, expect, it } from "vitest";
import { createDungeonRuntime, stepDungeonRuntime } from "./dungeonRuntime";

function walkToKey(runtime: ReturnType<typeof createDungeonRuntime>) {
  return stepDungeonRuntime(runtime, { playerPosition: runtime.layout.rooms.find((room) => room.roomId === "key")!.center, deltaMs: 16, playerStrike: false, interact: false });
}

function openDoor(runtime: ReturnType<typeof createDungeonRuntime>) {
  let next = walkToKey(runtime);
  next = stepDungeonRuntime(next, { playerPosition: next.layout.keyPosition, deltaMs: 16, playerStrike: false, interact: true });
  return stepDungeonRuntime(next, { playerPosition: next.layout.doorPosition, deltaMs: 16, playerStrike: false, interact: true });
}

describe("dungeon runtime adapter", () => {
  it("collects the key and opens the locked door through domain transitions", () => {
    let runtime = walkToKey(createDungeonRuntime(11));
    runtime = stepDungeonRuntime(runtime, { playerPosition: runtime.layout.keyPosition, deltaMs: 16, playerStrike: false, interact: true });
    expect(runtime.run.keys).toBe(1);
    expect(runtime.lastEvent).toBe("key-collected");
    runtime = stepDungeonRuntime(runtime, { playerPosition: runtime.layout.doorPosition, deltaMs: 16, playerStrike: false, interact: true });
    expect(runtime.run.openedDoor).toBe(true);
    expect(runtime.lastEvent).toBe("door-opened");
  });

  it("opens the treasure chest exactly once", () => {
    let runtime = openDoor(createDungeonRuntime(12));
    const treasure = runtime.layout.rooms.find((room) => room.roomId === "treasure")!.center;
    runtime = stepDungeonRuntime(runtime, { playerPosition: treasure, deltaMs: 16, playerStrike: false, interact: true });
    runtime = stepDungeonRuntime(runtime, { playerPosition: runtime.layout.chestPosition, deltaMs: 16, playerStrike: false, interact: true });
    expect(runtime.run.openedChestIds).toEqual(["first-dungeon-chest"]);
    runtime = stepDungeonRuntime(runtime, { playerPosition: runtime.layout.chestPosition, deltaMs: 16, playerStrike: false, interact: true });
    expect(runtime.lastEvent).toBe("none");
    expect(runtime.run.openedChestIds).toEqual(["first-dungeon-chest"]);
  });

  it("reflects strike-driven encounter FSM state and boss defeat", () => {
    let runtime = openDoor(createDungeonRuntime(13));
    const bossRoom = runtime.layout.rooms.find((room) => room.roomId === "boss")!.center;
    runtime = stepDungeonRuntime(runtime, { playerPosition: bossRoom, deltaMs: 16, playerStrike: false, interact: false });
    const boss = runtime.layout.encounters.find((encounter) => encounter.name === "Dungeon Boss")!;
    for (let hit = 0; hit < 8; hit += 1) {
      runtime = stepDungeonRuntime(runtime, { playerPosition: boss.position, deltaMs: 16, playerStrike: true, interact: false });
    }
    expect(runtime.enemies.find((enemy) => enemy.name === "Dungeon Boss")?.state.phase).toBe("defeated");
    expect(runtime.run.bossDefeated).toBe(true);
    expect(runtime.lastEvent).toBe("boss-defeated");
  });
});
