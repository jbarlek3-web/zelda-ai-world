import { describe, expect, it } from "vitest";
import { guideFallback } from "./guideNarrative";

describe("guide fallback", () => {
  it("provides an encounter-specific, deterministic response", () => {
    expect(guideFallback("Settle the river wisp")).toContain("river-staff");
  });

  it("provides a nonempty default response for other journey objectives", () => {
    expect(guideFallback("Seek the Tideglass Beacon").length).toBeGreaterThan(30);
  });
});
