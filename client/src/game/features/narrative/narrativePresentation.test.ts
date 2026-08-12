import { describe, expect, it } from "vitest";
import { resolveNarrativeDisplay } from "./narrativePresentation";

describe("narrative presentation", () => {
  it("uses model text when the bounded narrative mutation succeeds", () => {
    expect(resolveNarrativeDisplay("The river answers in a quiet current.", "Seek the Tideglass Beacon")).toBe("The river answers in a quiet current.");
  });

  it("uses deterministic fallback copy for an error, blank response, or rate-limit result", () => {
    const fallback = resolveNarrativeDisplay(null, "Settle the river wisp");
    expect(fallback).toContain("river-staff");
    expect(resolveNarrativeDisplay("   ", "Settle the river wisp")).toBe(fallback);
  });
});
