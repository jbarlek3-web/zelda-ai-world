export type RiverWispPhase = "idle" | "approach" | "windup" | "strike" | "recover" | "defeated";

export interface RiverWispState {
  readonly phase: RiverWispPhase;
  readonly health: number;
  readonly phaseElapsedMs: number;
}

export interface RiverWispStepInput {
  readonly distanceToPlayer: number;
  readonly deltaMs: number;
  readonly playerStrike: boolean;
}

export interface RiverWispStepResult {
  readonly state: RiverWispState;
  readonly playerDamage: number;
  readonly behaviorPath: readonly string[];
}

export const RIVER_WISP_MAX_HEALTH = 3;
export const RIVER_WISP_PLAYER_HIT_RANGE = 2.2;
const WISP_NOTICE_RANGE = 7;
const WISP_STRIKE_RANGE = 1.75;
const WINDUP_MS = 430;
const STRIKE_HIT_MS = 100;
const STRIKE_END_MS = 180;
const RECOVER_MS = 520;

export function createRiverWisp(): RiverWispState {
  return { phase: "idle", health: RIVER_WISP_MAX_HEALTH, phaseElapsedMs: 0 };
}

function nextPhase(state: RiverWispState, phase: RiverWispPhase): RiverWispState {
  return { ...state, phase, phaseElapsedMs: 0 };
}

function behaviorPath(phase: RiverWispPhase): readonly string[] {
  return ["Selector", "River wisp encounter", phase];
}

export function stepRiverWisp(state: RiverWispState, input: RiverWispStepInput): RiverWispStepResult {
  if (!Number.isFinite(input.deltaMs) || input.deltaMs < 0) {
    throw new Error("deltaMs must be a non-negative finite value");
  }
  if (!Number.isFinite(input.distanceToPlayer) || input.distanceToPlayer < 0) {
    throw new Error("distanceToPlayer must be a non-negative finite value");
  }
  if (state.phase === "defeated") {
    return { state, playerDamage: 0, behaviorPath: behaviorPath(state.phase) };
  }

  if (input.playerStrike && input.distanceToPlayer <= RIVER_WISP_PLAYER_HIT_RANGE) {
    const health = Math.max(0, state.health - 1);
    const hitState = { ...state, health };
    const next = health === 0 ? nextPhase(hitState, "defeated") : nextPhase(hitState, "recover");
    return { state: next, playerDamage: 0, behaviorPath: behaviorPath(next.phase) };
  }

  const elapsed = state.phaseElapsedMs + input.deltaMs;
  let next = { ...state, phaseElapsedMs: elapsed };
  let playerDamage = 0;

  switch (state.phase) {
    case "idle":
      if (input.distanceToPlayer <= WISP_NOTICE_RANGE) next = nextPhase(next, "approach");
      break;
    case "approach":
      if (input.distanceToPlayer <= WISP_STRIKE_RANGE) next = nextPhase(next, "windup");
      break;
    case "windup":
      if (elapsed >= WINDUP_MS) next = nextPhase(next, "strike");
      break;
    case "strike":
      playerDamage = state.phaseElapsedMs < STRIKE_HIT_MS && elapsed >= STRIKE_HIT_MS ? 1 : 0;
      if (elapsed >= STRIKE_END_MS) next = nextPhase(next, "recover");
      break;
    case "recover":
      if (elapsed >= RECOVER_MS) next = nextPhase(next, "approach");
      break;
  }

  return { state: next, playerDamage, behaviorPath: behaviorPath(next.phase) };
}
