// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { resolveNarrativeDisplay } from "@/game/features/narrative/narrativePresentation";
import { NarrativeSheet } from "./NarrativeSheet";

describe("NarrativeSheet", () => {
  it("renders deterministic fallback content rather than a raw rate-limit or provider error", () => {
    const fallback = resolveNarrativeDisplay(null, "Settle the river wisp");
    render(<NarrativeSheet open pending={false} text={fallback} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog").textContent).toContain("river-staff");
    expect(screen.queryByText(/TOO_MANY_REQUESTS|provider error|TRPCClientError/i)).toBeNull();
  });
});
