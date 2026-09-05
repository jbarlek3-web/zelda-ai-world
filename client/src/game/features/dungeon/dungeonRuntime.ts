import {
  collectDungeonKey,
  createFirstDungeon,
  createFirstDungeonRun,
  defeatDungeonBoss,
  moveDungeonRoom,
  openDungeonChest,
  tryOpenLockedDoor,
  type FirstDungeonPlan,
  type FirstDungeonRun,
} from "./firstDungeon";
import { createDungeonEnemy, stepDungeonEnemy, type DungeonEnemyName, type DungeonEnemyState } from "./dungeonEncounters";
import { createFirstDungeonWorldLayout, isPointInsideDungeonRoom, type DungeonWorldPoint, type FirstDungeonWorldLayout } from "./dungeonLayout";

export interface DungeonRuntimeEnemy {
  readonly name: DungeonEnemyName;
  readonly state: DungeonEnemyState;
}

export interface DungeonRuntimeState {
  readonly plan: FirstDungeonPlan;
  readonly layout: FirstDungeonWorldLayout;
  readonly run: FirstDungeonRun;
  readonly enemies: readonly DungeonRuntimeEnemy[];
  readonly playerDamage: number;
  readonly lastEvent: "none" | "key-collected" | "door-opened" | "chest-opened" | "boss-defeated";
}

export interface DungeonRuntimeInput {
  readonly playerPosition: DungeonWorldPoint;
  readonly deltaMs: number;
  readonly playerStrike: boolean;
  readonly interact: boolean;
}

function distanceSquared(a: DungeonWorldPoint, b: DungeonWorldPoint): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function updateCurrentRoom(state: DungeonRuntimeState, playerPosition: DungeonWorldPoint): FirstDungeonRun {
  const room = state.layout.rooms.find((candidate) => isPointInsideDungeonRoom(playerPosition, candidate));
  return room ? moveDungeonRoom(state.plan, state.run, room.roomId) : state.run;
}

function interactWithDungeon(state: DungeonRuntimeState, run: FirstDungeonRun, playerPosition: DungeonWorldPoint): Readonly<{ run: FirstDungeonRun; event: DungeonRuntimeState["lastEvent"] }> {
  if (!state.layout.rooms.some((room) => room.roomId === run.currentRoomId)) return { run, event: "none" };
  if (distanceSquared(playerPosition, state.layout.keyPosition) <= 1.8 && run.currentRoomId === state.plan.keyRoomId) {
    const next = collectDungeonKey(state.plan, run);
    return { run: next, event: next !== run ? "key-collected" : "none" };
  }
  if (distanceSquared(playerPosition, state.layout.doorPosition) <= 2.1 && run.currentRoomId === state.plan.keyRoomId) {
    const next = tryOpenLockedDoor(state.plan, run);
    return { run: next, event: next !== run ? "door-opened" : "none" };
  }
  if (distanceSquared(playerPosition, state.layout.chestPosition) <= 1.8 && run.currentRoomId === "treasure") {
    const next = openDungeonChest(run, "first-dungeon-chest");
    return { run: next, event: next !== run ? "chest-opened" : "none" };
  }
  return { run, event: "none" };
}

export function createDungeonRuntime(seed: number): DungeonRuntimeState {
  const plan = createFirstDungeon(seed);
  return {
    plan,
    layout: createFirstDungeonWorldLayout(plan),
    run: createFirstDungeonRun(plan),
    enemies: ["Skulltula", "Moblin", "Dungeon Boss"].map((name) => ({ name: name as DungeonEnemyName, state: createDungeonEnemy(name as DungeonEnemyName) })),
    playerDamage: 0,
    lastEvent: "none",
  };
}

export function stepDungeonRuntime(state: DungeonRuntimeState, input: DungeonRuntimeInput): DungeonRuntimeState {
  if (!Number.isFinite(input.deltaMs) || input.deltaMs < 0) throw new Error("Dungeon runtime requires finite non-negative timing.");
  const roomRun = updateCurrentRoom(state, input.playerPosition);
  const interaction = input.interact ? interactWithDungeon(state, roomRun, input.playerPosition) : { run: roomRun, event: "none" as const };
  let playerDamage = 0;
  const enemies = state.enemies.map((enemy) => {
    const placement = state.layout.encounters.find((candidate) => candidate.name === enemy.name);
    if (!placement) return enemy;
    const distance = Math.sqrt(distanceSquared(input.playerPosition, placement.position));
    const stepped = stepDungeonEnemy(enemy.state, { distanceToPlayer: distance, deltaMs: input.deltaMs, playerStrike: input.playerStrike });
    playerDamage += stepped.playerDamage;
    return { ...enemy, state: stepped.state };
  });
  const boss = enemies.find((enemy) => enemy.name === "Dungeon Boss");
  const defeatedRun = boss?.state.phase === "defeated" ? defeatDungeonBoss(state.plan, interaction.run) : interaction.run;
  return { ...state, run: defeatedRun, enemies, playerDamage, lastEvent: boss?.state.phase === "defeated" && !state.run.bossDefeated ? "boss-defeated" : interaction.event };
}
