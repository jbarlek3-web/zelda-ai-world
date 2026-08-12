// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { guideFallback } from "@/game/features/narrative/guideNarrative";
import { GameMasterRibbon } from "./GameMasterRibbon";

describe("GameMasterRibbon", () => {
  it("renders fallback narration from the safe-return event without raw error output", () => {
    render(<GameMasterRibbon text={guideFallback("Settle the river wisp")} />);
    expect(screen.getByRole("status").textContent).toContain("river-staff");
    expect(screen.queryByText(/TOO_MANY_REQUESTS|provider error|TRPCClientError/i)).toBeNull();
  });
});
