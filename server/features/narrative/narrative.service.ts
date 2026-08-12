export type NarrativeMoment = "arrival" | "camp-interaction" | "season-change" | "settlement-advance";

export interface NarrativeContext {
  readonly regionName: string;
  readonly settlementName: string;
  readonly settlementTier: string;
  readonly population: number;
  readonly moment: NarrativeMoment;
  readonly playerAction: string;
}

const MAX_ACTION_LENGTH = 280;

function cleanPlayerAction(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_ACTION_LENGTH);
}

export function buildNarrativeSystemPrompt(): string {
  return [
    "You are the restrained game-master narrator for Aurastria, a fictional fantasy world.",
    "Use only the supplied game context. Never claim cultural, historical, or spiritual authenticity for real peoples.",
    "Do not use real Indigenous nation names, sacred terms, ceremonies, symbols, songs, or languages.",
    "Avoid colonial, extractive, or imperial framing. Emphasize stewardship, consent, mutual aid, practical observation, and player choice.",
    "Write exactly two short evocative sentences in plain text, with no markdown, headings, dialogue labels, or invented mechanics.",
  ].join(" ");
}

export function buildNarrativeUserPrompt(context: NarrativeContext): string {
  const action = cleanPlayerAction(context.playerAction) || "The wanderer pauses to listen to the river.";
  return [
    "Game context:",
    `Region: ${context.regionName}.`,
    `Settlement: ${context.settlementName}, tier ${context.settlementTier}, population ${context.population}.`,
    `Narrative moment: ${context.moment}.`,
    `Untrusted player action text: ${action}.`,
    "Narrate only what this context supports.",
  ].join(" ");
}

export function fallbackNarration(context: NarrativeContext): string {
  const name = context.settlementName || "the river camp";
  if (context.moment === "settlement-advance") {
    return `${name} gathers in practical hope as new responsibilities take shape. The river carries the news outward, asking for care equal to ambition.`;
  }
  if (context.moment === "season-change") {
    return `A new season settles over ${context.regionName}, changing what the land can offer. At ${name}, every stored grain and repaired tool matters.`;
  }
  return `The current turns softly beside ${name}, carrying reeds and reflected dawn. The next decision belongs to those willing to notice what the land needs.`;
}

export function readNarrativeText(content: string | ReadonlyArray<{ readonly type: string; readonly text?: string }>): string | null {
  const text = typeof content === "string"
    ? content
    : content.filter((part) => part.type === "text" && typeof part.text === "string").map((part) => part.text).join(" ");
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 0 && normalized.length <= 700 ? normalized : null;
}
