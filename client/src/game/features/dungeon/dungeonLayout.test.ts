import { describe, expect, it } from "vitest";
import { createFirstDungeon } from "./firstDungeon";
import { createFirstDungeonWorldLayout, isPointInsideDungeonRoom } from "./dungeonLayout";

describe("first dungeon world layout", () => {
  it("places the required rooms and encounter actors deterministically", () => {
    const first = createFirstDungeonWorldLayout(createFirstDungeon(42));
    const second = createFirstDungeonWorldLayout(createFirstDungeon(42));
    expect(first).toEqual(second);
    expect(first.rooms.map((room) => room.roomId)).toEqual(["entry", "key", "cache", "gate", "treasure", "boss"]);
    expect(first.encounters.map((encounter) => encounter.name)).toEqual(["Skulltula", "Moblin", "Dungeon Boss"]);
  });

  it("keeps every actor and interactable inside its owning room", () => {
    const layout = createFirstDungeonWorldLayout(createFirstDungeon(7));
    const roomById = new Map(layout.rooms.map((room) => [room.roomId, room]));
    layout.encounters.forEach((encounter) => expect(isPointInsideDungeonRoom(encounter.position, roomById.get(encounter.roomId)!)).toBe(true));
    expect(isPointInsideDungeonRoom(layout.keyPosition, roomById.get("key")!)).toBe(true);
    expect(isPointInsideDungeonRoom(layout.chestPosition, roomById.get("treasure")!)).toBe(true);
    expect(isPointInsideDungeonRoom(layout.doorPosition, roomById.get("key")!)).toBe(true);
  });
});
