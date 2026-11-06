import { describe, it, expect } from "vitest";
import { damp, splitProgress, lerpTable } from "./motion.js";

describe("damp", () => {
  it("moves part of the way toward the target, frame-rate independently", () => {
    const one = damp(0, 1, 1.2, 0.5);
    let two = damp(0, 1, 1.2, 0.25);
    two = damp(two, 1, 1.2, 0.25);
    expect(one).toBeGreaterThan(0);
    expect(one).toBeLessThan(1);
    expect(two).toBeCloseTo(one, 10);
  });

  it("is slow: well short of the target after a quarter second", () => {
    expect(damp(0, 1, 1.2, 0.25)).toBeLessThan(0.3);
  });

  it("settles within a few seconds", () => {
    let v = 0;
    for (let i = 0; i < 300; i++) v = damp(v, 4, 1.2, 1 / 60);
    expect(v).toBeGreaterThan(3.9);
  });

  it("returns the target for dt <= 0 is a no-op and huge dt snaps", () => {
    expect(damp(0.3, 1, 1.2, 0)).toBe(0.3);
    expect(damp(0.3, 1, 1.2, 1000)).toBeCloseTo(1, 6);
  });
});

describe("splitProgress", () => {
  it("splits a continuous progress into from/to/mix", () => {
    expect(splitProgress(0, 5)).toEqual({ from: 0, to: 1, mix: 0 });
    const f = splitProgress(2.25, 5);
    expect(f.from).toBe(2);
    expect(f.to).toBe(3);
    expect(f.mix).toBeCloseTo(0.25);
  });

  it("holds the last formation at the end", () => {
    expect(splitProgress(4, 5)).toEqual({ from: 3, to: 4, mix: 1 });
    expect(splitProgress(9, 5)).toEqual({ from: 3, to: 4, mix: 1 });
  });

  it("clamps below zero", () => {
    expect(splitProgress(-1, 5)).toEqual({ from: 0, to: 1, mix: 0 });
  });
});

describe("lerpTable", () => {
  it("interpolates a per-formation value at a fractional progress", () => {
    const t = [1, 0.5, 0, 0.5, 1];
    expect(lerpTable(t, 0)).toBe(1);
    expect(lerpTable(t, 1.5)).toBeCloseTo(0.25);
    expect(lerpTable(t, 4)).toBe(1);
    expect(lerpTable(t, 7)).toBe(1);
  });
});
