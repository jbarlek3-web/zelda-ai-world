// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutationHandlers: Array<{ onError?: (error: Error) => void }> = [];

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, loading: false }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/components/game/TouchControls", () => ({ TouchControls: () => null }));
vi.mock("@/components/game/GameCanvas", () => ({
  GameCanvas: ({ onStatus }: { onStatus: (status: string) => void }) => <button onClick={() => onStatus("The river carries you safely back to camp. No journey progress was lost.")}>Simulate safe return</button>,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ saves: { list: { invalidate: vi.fn() } } }),
    saves: {
      list: { useQuery: () => ({ data: [] }) },
      load: { useQuery: () => ({ refetch: vi.fn(), isFetching: false }) },
      upsert: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      remove: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
    narrative: {
      narrate: {
        useMutation: (handlers: { onError?: (error: Error) => void }) => {
          mutationHandlers.push(handlers);
          return { isPending: false, mutate: () => handlers.onError?.(new Error("TOO_MANY_REQUESTS")) };
        },
      },
    },
  },
}));

import Home from "./Home";

describe("Home narrative mutation integration", () => {
  beforeEach(() => {
    mutationHandlers.length = 0;
    window.history.replaceState({}, "", "/?journey=play");
  });

  it("renders deterministic fallback copy for a rate-limited guide request and the safe-return Game Master event", async () => {
    render(<Home />);
    fireEvent.click(await screen.findByRole("button", { name: /ask the river guide/i }));
    expect((await screen.findByRole("dialog")).textContent).toContain("Tideglass does not command");
    expect(screen.queryByText(/TOO_MANY_REQUESTS|TRPCClientError|provider error/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Simulate safe return" }));
    expect((await screen.findByRole("status")).textContent).toContain("Tideglass does not command");
    expect(screen.queryByText(/TOO_MANY_REQUESTS|TRPCClientError|provider error/i)).toBeNull();
  });
});
