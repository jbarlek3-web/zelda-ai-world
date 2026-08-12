export type FirstDungeonRoomKind = "entry" | "key-room" | "side-cache" | "locked-gate" | "treasure-room" | "boss-room";

export interface FirstDungeonRoom {
  readonly id: string;
  readonly kind: FirstDungeonRoomKind;
  readonly neighbors: readonly string[];
}

export interface FirstDungeonPlan {
  readonly seed: number;
  readonly entryRoomId: string;
  readonly keyRoomId: string;
  readonly bossRoomId: string;
  readonly lockedDoor: Readonly<{ from: string; to: string; keysRequired: number }>;
  readonly rooms: readonly FirstDungeonRoom[];
}

export interface FirstDungeonRun {
  readonly currentRoomId: string;
  readonly keys: number;
  readonly openedDoor: boolean;
  readonly openedChestIds: readonly string[];
  readonly bossDefeated: boolean;
}

const ROOM_LAYOUT: readonly FirstDungeonRoom[] = [
  { id: "entry", kind: "entry", neighbors: ["key", "cache"] },
  { id: "key", kind: "key-room", neighbors: ["entry", "gate"] },
  { id: "cache", kind: "side-cache", neighbors: ["entry"] },
  { id: "gate", kind: "locked-gate", neighbors: ["key", "treasure", "boss"] },
  { id: "treasure", kind: "treasure-room", neighbors: ["gate"] },
  { id: "boss", kind: "boss-room", neighbors: ["gate"] },
];

export function createFirstDungeon(seed: number): FirstDungeonPlan {
  return {
    seed: Math.abs(Math.trunc(seed)),
    entryRoomId: "entry",
    keyRoomId: "key",
    bossRoomId: "boss",
    lockedDoor: { from: "key", to: "gate", keysRequired: 1 },
    rooms: ROOM_LAYOUT,
  };
}

export function createFirstDungeonRun(plan: FirstDungeonPlan): FirstDungeonRun {
  return { currentRoomId: plan.entryRoomId, keys: 0, openedDoor: false, openedChestIds: [], bossDefeated: false };
}

export function resetFirstDungeonRun(plan: FirstDungeonPlan, run: FirstDungeonRun): FirstDungeonRun {
  return run.currentRoomId === plan.entryRoomId && run.keys === 0 && !run.openedDoor && run.openedChestIds.length === 0 && !run.bossDefeated
    ? run
    : createFirstDungeonRun(plan);
}

export function collectDungeonKey(plan: FirstDungeonPlan, run: FirstDungeonRun): FirstDungeonRun {
  return run.currentRoomId === plan.keyRoomId && run.keys === 0 ? { ...run, keys: 1 } : run;
}

export function tryOpenLockedDoor(plan: FirstDungeonPlan, run: FirstDungeonRun): FirstDungeonRun {
  return !run.openedDoor && run.currentRoomId === plan.keyRoomId && run.keys >= plan.lockedDoor.keysRequired
    ? { ...run, keys: run.keys - plan.lockedDoor.keysRequired, openedDoor: true, currentRoomId: plan.lockedDoor.to }
    : run;
}

export function moveDungeonRoom(plan: FirstDungeonPlan, run: FirstDungeonRun, targetRoomId: string): FirstDungeonRun {
  const currentRoom = plan.rooms.find((room) => room.id === run.currentRoomId);
  if (!currentRoom || !currentRoom.neighbors.includes(targetRoomId)) return run;
  if (targetRoomId === plan.lockedDoor.to && !run.openedDoor) return run;
  return { ...run, currentRoomId: targetRoomId };
}

export function openDungeonChest(run: FirstDungeonRun, chestId: string): FirstDungeonRun {
  return run.openedChestIds.includes(chestId) ? run : { ...run, openedChestIds: [...run.openedChestIds, chestId] };
}

export function defeatDungeonBoss(plan: FirstDungeonPlan, run: FirstDungeonRun): FirstDungeonRun {
  return run.currentRoomId === plan.bossRoomId && !run.bossDefeated ? { ...run, bossDefeated: true } : run;
}

export function isFirstDungeonSolvable(plan: FirstDungeonPlan): boolean {
  let run = createFirstDungeonRun(plan);
  run = moveDungeonRoom(plan, run, plan.keyRoomId);
  run = collectDungeonKey(plan, run);
  run = tryOpenLockedDoor(plan, run);
  run = moveDungeonRoom(plan, run, plan.bossRoomId);
  run = defeatDungeonBoss(plan, run);
  return run.bossDefeated;
}
