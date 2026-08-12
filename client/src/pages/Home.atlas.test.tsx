// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, loading: false }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ saves: { list: { invalidate: vi.fn() } } }),
    saves: {
      list: { useQuery: () => ({ data: [] }) },
      load: { useQuery: () => ({ isFetching: false, refetch: vi.fn() }) },
      upsert: { useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }) },
      remove: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
    narrative: { narrate: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) } },
  },
}));

import Home from "./Home";

describe("Home atlas title flow", () => {
  it("opens the original atlas from the title screen and returns to the journey title", () => {
    window.history.replaceState({}, "", "/");
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Open atlas" }));
    expect(screen.getByText("Great River Spine")).toBeTruthy();
    expect(screen.getAllByText("sealed")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Return to journey" }));
    expect(screen.getByText("Spirits of the First Dawn")).toBeTruthy();
  });
});
