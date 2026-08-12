// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TouchControls } from "./TouchControls";

describe("TouchControls roll affordance", () => {
  it("dispatches a roll action when the roll control is ready", () => {
    const onAction = vi.fn();
    render(<TouchControls strikeReady rollReady onMove={() => {}} onAction={onAction} />);

    const roll = screen.getByRole("button", { name: /dodge roll/i });
    expect((roll as HTMLButtonElement).disabled).toBe(false);
    expect(roll.textContent).toMatch(/roll/i);

    roll.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onAction).toHaveBeenCalledWith("roll");
  });

  it("disables the roll control and shows recovery copy while cooling down", () => {
    const onAction = vi.fn();
    render(<TouchControls strikeReady rollReady={false} onMove={() => {}} onAction={onAction} />);

    const roll = screen.getByRole("button", { name: /dodge roll/i });
    expect((roll as HTMLButtonElement).disabled).toBe(true);
    expect(roll.textContent).toMatch(/steady/i);
    expect(onAction).not.toHaveBeenCalled();
  });
});
  afterEach(() => cleanup());
