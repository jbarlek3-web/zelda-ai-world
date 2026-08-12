import { TRPCError } from "@trpc/server";
import { deleteSaveInputSchema, saveGameInputSchema, saveSlotSchema } from "../../../shared/game/schemas";
import { protectedProcedure, router } from "../../_core/trpc";
import { deleteSaveForUser, getSaveForUser, listSavesForUser, upsertSaveForUser } from "./saves.repository";
import { parseStoredSave } from "./saves.service";

function storageError(error: unknown): TRPCError {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Aurastria save storage failed.",
  });
}

export const savesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const records = await listSavesForUser(ctx.user.id);
      return records.map(parseStoredSave);
    } catch (error) {
      throw storageError(error);
    }
  }),
  load: protectedProcedure.input(saveSlotSchema).query(async ({ ctx, input }) => {
    try {
      const record = await getSaveForUser(ctx.user.id, input);
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Save slot ${input} is empty.` });
      }
      return parseStoredSave(record);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw storageError(error);
    }
  }),
  upsert: protectedProcedure.input(saveGameInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const record = await upsertSaveForUser(ctx.user.id, input);
      if (!record) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Save was not available after writing." });
      }
      return parseStoredSave(record);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw storageError(error);
    }
  }),
  remove: protectedProcedure.input(deleteSaveInputSchema).mutation(async ({ ctx, input }) => {
    try {
      return { removed: await deleteSaveForUser(ctx.user.id, input.slot) };
    } catch (error) {
      throw storageError(error);
    }
  }),
});
