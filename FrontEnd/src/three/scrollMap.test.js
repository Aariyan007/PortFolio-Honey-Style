import { describe, it, expect } from "vitest";
import { resolveFormation } from "./scrollMap.js";

// five sections, each 1000px tall, viewport 800px
const tops = [0, 1000, 2000, 3000, 4000];
const vh = 800;

describe("resolveFormation", () => {
  it("starts in the hero formation", () => {
    expect(resolveFormation(0, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("mixes while the next section's top travels from viewport bottom to 30%", () => {
    // transition 0→1 spans scrollY 200 (1000-800) .. 760 (1000-240)
    expect(resolveFormation(200, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
    expect(resolveFormation(480, vh, tops).mix).toBeCloseTo(0.5);
    expect(resolveFormation(760, vh, tops)).toEqual({ from: 0, to: 1, mix: 1 });
  });

  it("holds the finished formation, then starts the next transition", () => {
    expect(resolveFormation(1100, vh, tops)).toEqual({ from: 0, to: 1, mix: 1 });
    // transition 1→2 spans 1200..1760, so 1300 is 100/560 of the way in
    const f = resolveFormation(1300, vh, tops);
    expect(f.from).toBe(1);
    expect(f.to).toBe(2);
    expect(f.mix).toBeCloseTo(100 / 560);
  });

  it("clamps past the end", () => {
    expect(resolveFormation(99999, vh, tops)).toEqual({ from: 3, to: 4, mix: 1 });
  });

  it("clamps negative scroll (iOS rubber-band)", () => {
    expect(resolveFormation(-120, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("skips a missing section (Infinity top) instead of shifting formations", () => {
    const missingAbout = [0, Infinity, 2000, 3000, 4000];
    // past experience's transition start: maps to 1→2, not 0→1
    expect(resolveFormation(1500, vh, missingAbout).from).toBe(1);
    expect(resolveFormation(100, vh, missingAbout)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("handles fewer than two sections", () => {
    expect(resolveFormation(500, vh, [0])).toEqual({ from: 0, to: 0, mix: 0 });
    expect(resolveFormation(500, vh, [])).toEqual({ from: 0, to: 0, mix: 0 });
  });
});
