export function guideFallback(objective: string): string {
  if (objective === "Settle the river wisp") {
    return "Keep the wisp in sight. Let it close, give the river-staff a clear breath, then strike only when its current turns toward you.";
  }
  if (objective.includes("Gather")) {
    return "The camp needs only what the river can spare: pale reeds along the waterline and smooth stones where the current slows.";
  }
  return "The Tideglass does not command; it reveals a path. Follow the turquoise light, listen near the beacon, and return to camp with what the season asks for.";
}
