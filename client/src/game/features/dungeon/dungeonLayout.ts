import type { FirstDungeonPlan, FirstDungeonRoomKind } from "./firstDungeon";

export interface DungeonWorldPoint {
  readonly x: number;
  readonly z: number;
}

export interface DungeonRoomLayout {
  readonly roomId: string;
  readonly kind: FirstDungeonRoomKind;
  readonly center: DungeonWorldPoint;
  readonly halfExtent: DungeonWorldPoint;
}

export interface DungeonEncounterPlacement {
  readonly roomId: string;
  readonly name: "Skulltula" | "Moblin" | "Dungeon Boss";
  readonly position: DungeonWorldPoint;
}

export interface FirstDungeonWorldLayout {
  readonly seed: number;
  readonly rooms: readonly DungeonRoomLayout[];
  readonly encounters: readonly DungeonEncounterPlacement[];
  readonly keyPosition: DungeonWorldPoint;
  readonly chestPosition: DungeonWorldPoint;
  readonly doorPosition: DungeonWorldPoint;
}

const ROOM_HALF_EXTENT: DungeonWorldPoint = { x: 3.6, z: 3.2 };
const ROOM_SPACING = 8;

const ROOM_OFFSETS: Readonly<Record<string, DungeonWorldPoint>> = {
  entry: { x: 0, z: 0 },
  key: { x: 1, z: 0 },
  cache: { x: 0, z: 1 },
  gate: { x: 2, z: 0 },
  treasure: { x: 3, z: 0 },
  boss: { x: 2, z: 1 },
};

function roomCenter(roomId: string): DungeonWorldPoint {
  const offset = ROOM_OFFSETS[roomId] ?? ROOM_OFFSETS.entry;
  return { x: offset.x * ROOM_SPACING, z: offset.z * ROOM_SPACING };
}

function offsetPoint(center: DungeonWorldPoint, x: number, z: number): DungeonWorldPoint {
  return { x: center.x + x, z: center.z + z };
}

export function createFirstDungeonWorldLayout(plan: FirstDungeonPlan): FirstDungeonWorldLayout {
  const rooms = plan.rooms.map((room) => ({
    roomId: room.id,
    kind: room.kind,
    center: roomCenter(room.id),
    halfExtent: ROOM_HALF_EXTENT,
  }));
  const roomById = new Map(rooms.map((room) => [room.roomId, room]));
  const cache = roomById.get("cache");
  const gate = roomById.get("gate");
  const key = roomById.get(plan.keyRoomId);
  const treasure = roomById.get("treasure");
  const boss = roomById.get(plan.bossRoomId);
  if (!cache || !gate || !key || !treasure || !boss) throw new Error("First dungeon layout is missing a required room.");

  return {
    seed: plan.seed,
    rooms,
    encounters: [
      { roomId: cache.roomId, name: "Skulltula", position: offsetPoint(cache.center, 0, 0) },
      { roomId: gate.roomId, name: "Moblin", position: offsetPoint(gate.center, 0, 0) },
      { roomId: boss.roomId, name: "Dungeon Boss", position: offsetPoint(boss.center, 0, 0) },
    ],
    keyPosition: offsetPoint(key.center, 0, 0),
    chestPosition: offsetPoint(treasure.center, 0, 0),
    doorPosition: offsetPoint(key.center, ROOM_HALF_EXTENT.x - 0.15, 0),
  };
}

export function isPointInsideDungeonRoom(point: DungeonWorldPoint, room: DungeonRoomLayout): boolean {
  return Math.abs(point.x - room.center.x) <= room.halfExtent.x && Math.abs(point.z - room.center.z) <= room.halfExtent.z;
}
