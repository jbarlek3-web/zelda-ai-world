import { describe, expect, it } from "vitest";

import { FRAME_BUDGET_MS, FrameBudgetCollector } from "./frameBudget";

describe("FrameBudgetCollector", () => {
  it("discards warm-up frames so first-frame spikes do not skew the sample", () => {
    const collector = new FrameBudgetCollector({ warmUpFrames: 3, sampleFrames: 4 });

    [900, 500, 320].forEach((frame) => expect(collector.record(frame)).toBeUndefined());
    expect(collector.record(10)).toBeUndefined();
    expect(collector.record(10)).toBeUndefined();
    expect(collector.record(12)).toBeUndefined();
    const sample = collector.record(10);

    expect(sample).toBeDefined();
    expect(sample!.sampledFrames).toBe(4);
    expect(sample!.worstFrameMs).toBe(12);
    expect(sample!.withinBudget).toBe(true);
  });

  it("reports a failing verdict when the median exceeds the 60 FPS budget", () => {
    const collector = new FrameBudgetCollector({ warmUpFrames: 0, sampleFrames: 3 });
    collector.record(30);
    collector.record(33);
    const sample = collector.record(36);

    expect(sample!.withinBudget).toBe(false);
    expect(sample!.medianFrameMs).toBeGreaterThan(FRAME_BUDGET_MS);
    expect(sample!.effectiveFps).toBeLessThan(60);
  });

  it("stops collecting once the window is complete", () => {
    const collector = new FrameBudgetCollector({ warmUpFrames: 0, sampleFrames: 2 });
    collector.record(10);
    expect(collector.record(10)).toBeDefined();
    expect(collector.complete).toBe(true);
    expect(collector.record(999)).toBeUndefined();
    expect(collector.sample().worstFrameMs).toBe(10);
  });
});

