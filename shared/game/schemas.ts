import { z } from "zod";

export const regionIdSchema = z.enum([
  "frozen-dawn-tundra",
  "sky-cutter-mountains",
  "verdant-spiritwood",
  "great-river-spine",
  "jaguar-veil-rainforest",
  "painted-desert-wastes",
  "emberback-archipelago",
  "storm-coast-archipelago",
]);

export const resourceKindSchema = z.enum(["wood", "stone", "clay", "hides", "fibers", "metals", "crops", "fish"]);

export const buildingKindSchema = z.enum([
  "longhouse",
  "earth-lodge",
  "granary",
  "sweat-lodge",
  "council-house",
  "dock",
  "workshop",
]);

export const vec2Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const playerIntentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("move"), direction: vec2Schema, magnitude: z.number().min(0).max(1) }),
  z.object({ type: z.literal("interact") }),
  z.object({ type: z.literal("open-settlement") }),
  z.object({ type: z.literal("toggle-pause") }),
]);

export const resourceLedgerSchema = z.object({
  wood: z.number().int().min(0),
  stone: z.number().int().min(0),
  clay: z.number().int().min(0),
  hides: z.number().int().min(0),
  fibers: z.number().int().min(0),
  metals: z.number().int().min(0),
  crops: z.number().int().min(0),
  fish: z.number().int().min(0),
});

export const saveStateSchema = z.object({
  version: z.literal(1),
  worldSeed: z.number().int().nonnegative(),
  regionId: regionIdSchema,
  playerPosition: z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() }),
  resources: resourceLedgerSchema,
  completedQuestIds: z.array(z.string().min(1)).max(500),
});

export type SaveStateInput = z.infer<typeof saveStateSchema>;
