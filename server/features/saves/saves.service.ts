import { saveStateSchema, type SaveGameInput, type SaveStateInput } from "../../../shared/game/schemas";

export interface SaveListItem {
  readonly slot: number;
  readonly label: string;
  readonly updatedAt: Date;
  readonly state: SaveStateInput;
}

export function parseStoredSave(record: { slot: number; label: string; stateJson: string; updatedAt: Date }): SaveListItem {
  const parsed = saveStateSchema.safeParse(JSON.parse(record.stateJson));
  if (!parsed.success) {
    throw new Error(`Save slot ${record.slot} is incompatible with the current Aurastria version.`);
  }
  return { slot: record.slot, label: record.label, updatedAt: record.updatedAt, state: parsed.data };
}

export function saveSummary(input: SaveGameInput): Pick<SaveListItem, "slot" | "label" | "state"> {
  return { slot: input.slot, label: input.label, state: input.state };
}
