export type AtlasUnlock = "current" | "rumored" | "sealed";

export interface AtlasRegion {
  readonly id: string;
  readonly name: string;
  readonly route: string;
  readonly element: string;
  readonly unlock: AtlasUnlock;
  readonly description: string;
  readonly accentClass: string;
}

export const AURASTRIA_ATLAS: readonly AtlasRegion[] = [
  { id: "great-river-spine", name: "Great River Spine", route: "Founding route", element: "Tideglass", unlock: "current", description: "A braided river basin where the first camp learns its shared rhythms.", accentClass: "border-[#69ddd4] bg-[#1a615c]" },
  { id: "ashfall-march", name: "Ashfall March", route: "Western passage", element: "Ember", unlock: "rumored", description: "Black stone terraces and warm springs beyond the first river road.", accentClass: "border-[#ef9a61] bg-[#713f2d]" },
  { id: "verdant-canopy", name: "Verdant Canopy", route: "Southern passage", element: "Bloom", unlock: "rumored", description: "A living green expanse where rain paths gather beneath enormous leaves.", accentClass: "border-[#9edb7a] bg-[#2d5b3a]" },
  { id: "cobalt-shoals", name: "Cobalt Shoals", route: "Eastern passage", element: "Storm", unlock: "sealed", description: "Bright water and weather-sculpted islands, visible only beyond the coastal route.", accentClass: "border-[#8abcf2] bg-[#27547b]" },
  { id: "starless-crown", name: "Starless Crown", route: "Northern passage", element: "Veil", unlock: "sealed", description: "A high, quiet ridge whose old lights are not yet part of this journey.", accentClass: "border-[#bc9eea] bg-[#503b6d]" },
];

export function atlasAccessibilityLabel(region: AtlasRegion): string {
  return `${region.name}, ${region.element} region, ${region.unlock === "current" ? "current route" : region.unlock === "rumored" ? "rumored route" : "sealed route"}. ${region.description}`;
}
