import { z } from "zod";
import { invokeLLM } from "../../_core/llm";
import { publicProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { buildNarrativeSystemPrompt, buildNarrativeUserPrompt, fallbackNarration, NarrativeRateLimiter, readNarrativeText } from "./narrative.service";

const narrativeRateLimiter = new NarrativeRateLimiter();

const narrativeInput = z.object({
  regionName: z.string().trim().min(1).max(80),
  settlementName: z.string().trim().min(1).max(80),
  settlementTier: z.string().trim().min(1).max(40),
  population: z.number().int().min(1).max(10_000),
  moment: z.enum(["arrival", "camp-interaction", "season-change", "settlement-advance"]),
  playerAction: z.string().max(500),
});

export const narrativeRouter = router({
  narrate: publicProcedure.input(narrativeInput).mutation(async ({ input, ctx }) => {
    const requestKey = ctx.user ? String(ctx.user.id) : (ctx.req.ip ?? ctx.req.socket.remoteAddress ?? "anonymous");
    if (!narrativeRateLimiter.tryTake(requestKey, Date.now())) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "The river guide is considering your last question." });
    }
    const fallback = fallbackNarration(input);
    try {
      const result = await invokeLLM({
        maxTokens: 140,
        messages: [
          { role: "system", content: buildNarrativeSystemPrompt() },
          { role: "user", content: buildNarrativeUserPrompt(input) },
        ],
      });
      const responseText = readNarrativeText(result.choices[0]?.message.content ?? "");
      return { text: responseText ?? fallback, source: responseText ? "llm" as const : "fallback" as const };
    } catch (error) {
      console.warn("Aurastria narration unavailable; using deterministic fallback", error);
      return { text: fallback, source: "fallback" as const };
    }
  }),
});
