/** Deterministic integer generator for repeatable world simulation; never use Math.random in game rules. */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextUint32(): number {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state;
  }

  nextUnit(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  nextInt(minimumInclusive: number, maximumInclusive: number): number {
    if (!Number.isInteger(minimumInclusive) || !Number.isInteger(maximumInclusive) || maximumInclusive < minimumInclusive) {
      throw new Error("Invalid deterministic random range");
    }

    return minimumInclusive + Math.floor(this.nextUnit() * (maximumInclusive - minimumInclusive + 1));
  }
}

export function hashCoordinates(seed: number, x: number, y: number): number {
  let hash = seed ^ Math.imul(x, 0x9e3779b1) ^ Math.imul(y, 0x85ebca77);
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}
