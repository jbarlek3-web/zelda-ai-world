export interface MapPoint {
  readonly x: number;
  readonly z: number;
}

export interface BeaconNavigation {
  readonly bearingDegrees: number;
  readonly distance: number;
}

export function beaconNavigation(from: MapPoint, target: MapPoint): BeaconNavigation {
  const deltaX = target.x - from.x;
  const deltaZ = target.z - from.z;
  const bearing = (Math.atan2(deltaX, deltaZ) * 180 / Math.PI + 360) % 360;
  return {
    bearingDegrees: Math.round(bearing),
    distance: Math.round(Math.hypot(deltaX, deltaZ)),
  };
}
