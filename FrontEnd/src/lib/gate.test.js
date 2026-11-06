import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createGate } from "./gate.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createGate", () => {
  it("fires only after both reach() and open()", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.reach();
    expect(onOpen).not.toHaveBeenCalled();
    g.open();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("works in either order", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.open();
    g.reach();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("fires once even if called repeatedly", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.reach(); g.open(); g.open(); g.reach();
    vi.advanceTimersByTime(10_000);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(g.fired).toBe(true);
  });

  it("opens by itself after the timeout when the scene never reports ready", () => {
    const onOpen = vi.fn();
    const g = createGate({ timeoutMs: 5000, onOpen });
    g.reach();
    vi.advanceTimersByTime(4999);
    expect(onOpen).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("dispose cancels the timeout", () => {
    const onOpen = vi.fn();
    const g = createGate({ timeoutMs: 100, onOpen });
    g.reach();
    g.dispose();
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
