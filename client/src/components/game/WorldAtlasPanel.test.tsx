// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { WorldAtlasPanel } from "./WorldAtlasPanel";

it("renders the original atlas with a current river route and sealed regional previews", () => {
  render(<WorldAtlasPanel onClose={() => undefined} />);
  expect(screen.getByText("Great River Spine")).toBeTruthy();
  expect(screen.getAllByText("sealed")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Return to journey" })).toBeTruthy();
});
