import { describe, expect, it } from "vitest";
import { collectDungeonKey, createFirstDungeon, createFirstDungeonRun, defeatDungeonBoss, isFirstDungeonSolvable, moveDungeonRoom, openDungeonChest, resetFirstDungeonRun, tryOpenLockedDoor } from "./firstDungeon";

describe("first dungeon", () => {
  it("is deterministic and guarantees a key route to the boss", () => {
    const plan = createFirstDungeon(42);
    expect(createFirstDungeon(42)).toEqual(plan);
    expect(isFirstDungeonSolvable(plan)).toBe(true);
  });

  it("requires a key for the gate and keeps chest rewards idempotent", () => {
    const plan = createFirstDungeon(3);
    let run = moveDungeonRoom(plan, createFirstDungeonRun(plan), "key");
    expect(tryOpenLockedDoor(plan, run)).toEqual(run);
    run = collectDungeonKey(plan, run);
    run = tryOpenLockedDoor(plan, run);
    run = openDungeonChest(run, "tideglass-cache");
    expect(openDungeonChest(run, "tideglass-cache")).toEqual(run);
    run = moveDungeonRoom(plan, run, "boss");
    expect(defeatDungeonBoss(plan, run).bossDefeated).toBe(true);
  });

  it("resets a partial run to a safe entry state without preserving a locked-door soft-lock", () => {
    const plan = createFirstDungeon(11);
    let run = moveDungeonRoom(plan, createFirstDungeonRun(plan), "key");
    run = collectDungeonKey(plan, run);
    run = tryOpenLockedDoor(plan, run);
    run = openDungeonChest(run, "tideglass-cache");

    expect(resetFirstDungeonRun(plan, run)).toEqual(createFirstDungeonRun(plan));
  });
});
