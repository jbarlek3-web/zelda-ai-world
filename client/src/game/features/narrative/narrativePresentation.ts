import { guideFallback } from "./guideNarrative";

export function resolveNarrativeDisplay(responseText: string | null | undefined, objective: string): string {
  const normalized = responseText?.trim();
  return normalized ? normalized : guideFallback(objective);
}
