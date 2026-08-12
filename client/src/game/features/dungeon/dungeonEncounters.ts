export type DungeonEnemyName = "Skulltula" | "Moblin" | "Dungeon Boss";
export type DungeonEnemyPhase = "idle" | "approach" | "windup" | "strike" | "recover" | "defeated";

export interface DungeonEnemyState {
  readonly name: DungeonEnemyName;
  readonly phase: DungeonEnemyPhase;
  readonly health: number;
  readonly phaseElapsedMs: number;
}

export interface DungeonEnemyInput {
  readonly distanceToPlayer: number;
  readonly deltaMs: number;
  readonly playerStrike: boolean;
}

const CONFIG = {
  Skulltula: { health: 2, noticeRange: 5, hitRange: 1.45, windupMs: 360, recoverMs: 420 },
  Moblin: { health: 4, noticeRange: 6, hitRange: 1.8, windupMs: 520, recoverMs: 600 },
  "Dungeon Boss": { health: 8, noticeRange: 7, hitRange: 2.3, windupMs: 720, recoverMs: 760 },
} as const;

export function createDungeonEnemy(name: DungeonEnemyName): DungeonEnemyState {
  return { name, phase: "idle", health: CONFIG[name].health, phaseElapsedMs: 0 };
}

export function stepDungeonEnemy(state: DungeonEnemyState, input: DungeonEnemyInput): Readonly<{ state: DungeonEnemyState; playerDamage: number }> {
  if (!Number.isFinite(input.deltaMs) || input.deltaMs < 0 || !Number.isFinite(input.distanceToPlayer) || input.distanceToPlayer < 0) {
    throw new Error("Dungeon encounter requires finite non-negative timing and distance.");
  }
  if (state.phase === "defeated") return { state, playerDamage: 0 };
  const config = CONFIG[state.name];
  if (input.playerStrike && input.distanceToPlayer <= config.hitRange) {
    const health = Math.max(0, state.health - 1);
    return { state: { ...state, health, phase: health === 0 ? "defeated" : "recover", phaseElapsedMs: 0 }, playerDamage: 0 };
  }
  const elapsed = state.phaseElapsedMs + input.deltaMs;
  let next: DungeonEnemyState = { ...state, phaseElapsedMs: elapsed };
  let playerDamage = 0;
  if (state.phase === "idle" && input.distanceToPlayer <= config.noticeRange) next = { ...next, phase: "approach", phaseElapsedMs: 0 };
  if (state.phase === "approach" && input.distanceToPlayer <= config.hitRange) next = { ...next, phase: "windup", phaseElapsedMs: 0 };
  if (state.phase === "windup" && elapsed >= config.windupMs) next = { ...next, phase: "strike", phaseElapsedMs: 0 };
  if (state.phase === "strike") {
    playerDamage = state.phaseElapsedMs === 0 ? 1 : 0;
    next = { ...next, phase: "recover", phaseElapsedMs: 0 };
  }
  if (state.phase === "recover" && elapsed >= config.recoverMs) next = { ...next, phase: "approach", phaseElapsedMs: 0 };
  return { state: next, playerDamage };
}
