export function beaconArrivalScale(elapsedSeconds: number, reducedMotion: boolean): number {
  if (reducedMotion || elapsedSeconds < 0) {
    return 1;
  }
  if (elapsedSeconds < 0.1) {
    return 1 - elapsedSeconds * 0.4;
  }
  if (elapsedSeconds < 0.35) {
    return 0.96 + (elapsedSeconds - 0.1) * 0.56;
  }
  if (elapsedSeconds < 0.7) {
    return 1.1 - (elapsedSeconds - 0.35) * (0.1 / 0.35);
  }
  return 1;
}
