export type GameMasterMoment = "camp-interaction" | "settlement-advance";

export function gameMasterMomentForStatus(status: string): GameMasterMoment | null {
  if (status.includes("Founding need met")) return "settlement-advance";
  if (
    status.includes("Tideglass patterns")
    || status.includes("Collected")
    || status.includes("River wisp settled")
    || status.includes("safely back to camp")
  ) {
    return "camp-interaction";
  }
  return null;
}
