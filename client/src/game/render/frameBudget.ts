/**
 * Frame-budget measurement.
 *
 * Performance work here is measurement-first: this collector discards warm-up
 * frames (shader compilation, texture upload, first-frame layout) and then
 * reports a median over a fixed window, so a single spike cannot masquerade as
 * a regression and a lucky frame cannot hide one.
 */

export const TARGET_FPS = 60;
export const FRAME_BUDGET_MS = 1000 / TARGET_FPS;

export interface FrameBudgetSample {
  readonly medianFrameMs: number;
  readonly p95FrameMs: number;
  readonly worstFrameMs: number;
  readonly effectiveFps: number;
  readonly withinBudget: boolean;
  readonly sampledFrames: number;
}

export interface FrameBudgetOptions {
  /** Frames ignored before sampling starts. */
  readonly warmUpFrames?: number;
  /** Frames included in the reported sample. */
  readonly sampleFrames?: number;
}

const DEFAULT_WARM_UP_FRAMES = 45;
const DEFAULT_SAMPLE_FRAMES = 120;

function percentile(sortedValues: readonly number[], fraction: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(fraction * sortedValues.length) - 1));
  return sortedValues[index];
}

export class FrameBudgetCollector {
  private readonly warmUpFrames: number;
  private readonly sampleFrames: number;
  private readonly durations: number[] = [];
  private observedFrames = 0;

  constructor(options: FrameBudgetOptions = {}) {
    this.warmUpFrames = Math.max(0, options.warmUpFrames ?? DEFAULT_WARM_UP_FRAMES);
    this.sampleFrames = Math.max(1, options.sampleFrames ?? DEFAULT_SAMPLE_FRAMES);
  }

  /** Record one frame. Returns a sample on the frame the window completes, else undefined. */
  record(frameMs: number): FrameBudgetSample | undefined {
    this.observedFrames += 1;
    if (this.observedFrames <= this.warmUpFrames || this.durations.length >= this.sampleFrames) {
      return undefined;
    }

    this.durations.push(frameMs);
    return this.durations.length === this.sampleFrames ? this.sample() : undefined;
  }

  get complete(): boolean {
    return this.durations.length >= this.sampleFrames;
  }

  sample(): FrameBudgetSample {
    const sorted = [...this.durations].sort((a, b) => a - b);
    const medianFrameMs = percentile(sorted, 0.5);
    return {
      medianFrameMs: Number(medianFrameMs.toFixed(2)),
      p95FrameMs: Number(percentile(sorted, 0.95).toFixed(2)),
      worstFrameMs: Number((sorted[sorted.length - 1] ?? 0).toFixed(2)),
      effectiveFps: medianFrameMs > 0 ? Number((1000 / medianFrameMs).toFixed(1)) : 0,
      withinBudget: medianFrameMs > 0 && medianFrameMs <= FRAME_BUDGET_MS,
      sampledFrames: sorted.length,
    };
  }
}
