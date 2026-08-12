export type NpcAction = "signal-danger" | "seek-food" | "guide-player" | "work" | "rest" | "socialize";

export interface NpcBlackboard {
  readonly threatLevel: number;
  readonly hungerLevel: number;
  readonly fatigueLevel: number;
  readonly playerRequestedHelp: boolean;
  readonly assignedWorkAvailable: boolean;
}

export interface NpcDecision {
  readonly action: NpcAction;
  readonly behaviorPath: readonly string[];
}

const assertLevel = (level: number, field: string): void => {
  if (!Number.isFinite(level) || level < 0 || level > 100) {
    throw new Error(`${field} must be a finite number from 0 to 100`);
  }
};

/**
 * A compact behavior-tree selector expressed as data-rich pure logic. Higher-priority danger
 * branches naturally interrupt routine work, matching the observer-abort behaviour used in full BT systems.
 */
export function decideNpcAction(blackboard: NpcBlackboard): NpcDecision {
  assertLevel(blackboard.threatLevel, "threatLevel");
  assertLevel(blackboard.hungerLevel, "hungerLevel");
  assertLevel(blackboard.fatigueLevel, "fatigueLevel");

  if (blackboard.threatLevel >= 65) {
    return { action: "signal-danger", behaviorPath: ["Selector", "Danger sequence", "Signal danger"] };
  }
  if (blackboard.hungerLevel >= 70) {
    return { action: "seek-food", behaviorPath: ["Selector", "Needs sequence", "Seek food"] };
  }
  if (blackboard.playerRequestedHelp) {
    return { action: "guide-player", behaviorPath: ["Selector", "Help sequence", "Guide player"] };
  }
  if (blackboard.assignedWorkAvailable) {
    return { action: "work", behaviorPath: ["Selector", "Work sequence", "Complete assignment"] };
  }
  if (blackboard.fatigueLevel >= 65) {
    return { action: "rest", behaviorPath: ["Selector", "Rest sequence", "Recover"] };
  }
  return { action: "socialize", behaviorPath: ["Selector", "Community fallback", "Socialize"] };
}
