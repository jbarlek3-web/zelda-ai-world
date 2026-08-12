import { describe, expect, it } from "vitest";
import { parseStoredSave, saveSummary } from "./saves.service";

const state = {
  version: 1 as const,
  worldSeed: 42,
  regionId: "great-river-spine" as const,
  playerPosition: { x: 1, y: 0, z: 2 },
  resources: { wood: 0, stone: 2, clay: 0, hides: 0, fibers: 3, metals: 0, crops: 0, fish: 0 },
  completedQuestIds: ["founding-need"],
};

describe("Aurastria save persistence service", () => {
  it("parses a versioned stored state and retains save metadata", () => {
    const updatedAt = new Date("2026-08-12T00:00:00.000Z");
    expect(parseStoredSave({ slot: 1, label: "Founding Camp", stateJson: JSON.stringify(state), updatedAt }))
      .toMatchObject({ slot: 1, label: "Founding Camp", updatedAt, state });
  });

  it("rejects malformed stored state rather than returning unsafe persistence data", () => {
    expect(() => parseStoredSave({ slot: 1, label: "Broken", stateJson: "{}", updatedAt: new Date() }))
      .toThrow("incompatible");
  });

  it("keeps validated slot, label, and state when constructing a save summary", () => {
    expect(saveSummary({ slot: 2, label: "River Road", state })).toEqual({ slot: 2, label: "River Road", state });
  });
});
