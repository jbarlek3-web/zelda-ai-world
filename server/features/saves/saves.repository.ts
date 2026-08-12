import { and, asc, eq } from "drizzle-orm";
import { aurastriaSaves } from "../../../drizzle/schema";
import { getDb } from "../../db";
import type { SaveGameInput } from "../../../shared/game/schemas";

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Aurastria save storage is currently unavailable.");
  }
  return db;
}

export async function listSavesForUser(userId: number) {
  const db = await requireDb();
  return db.select({
    slot: aurastriaSaves.slot,
    label: aurastriaSaves.label,
    stateJson: aurastriaSaves.stateJson,
    updatedAt: aurastriaSaves.updatedAt,
  }).from(aurastriaSaves).where(eq(aurastriaSaves.userId, userId)).orderBy(asc(aurastriaSaves.slot));
}

export async function getSaveForUser(userId: number, slot: number) {
  const db = await requireDb();
  const records = await db.select().from(aurastriaSaves)
    .where(and(eq(aurastriaSaves.userId, userId), eq(aurastriaSaves.slot, slot)))
    .limit(1);
  return records[0];
}

export async function upsertSaveForUser(userId: number, input: SaveGameInput) {
  const db = await requireDb();
  const stateJson = JSON.stringify(input.state);
  await db.insert(aurastriaSaves).values({
    userId,
    slot: input.slot,
    label: input.label,
    stateJson,
  }).onDuplicateKeyUpdate({
    set: { label: input.label, stateJson, updatedAt: new Date() },
  });
  return getSaveForUser(userId, input.slot);
}

export async function deleteSaveForUser(userId: number, slot: number) {
  const db = await requireDb();
  const result = await db.delete(aurastriaSaves)
    .where(and(eq(aurastriaSaves.userId, userId), eq(aurastriaSaves.slot, slot)));
  return result[0].affectedRows > 0;
}
