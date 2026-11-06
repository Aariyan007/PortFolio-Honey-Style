import { describe, it, expect } from "vitest";
import { parseStat, formatStat } from "./countUp.js";

describe("parseStat", () => {
  it("splits a number with a suffix", () => {
    expect(parseStat("75+")).toEqual({ prefix: "", value: 75, suffix: "+", grouped: false });
  });

  it("reads thousands separators", () => {
    expect(parseStat("1,798")).toEqual({ prefix: "", value: 1798, suffix: "", grouped: true });
  });

  it("returns null for non-numeric stats", () => {
    expect(parseStat("✓")).toBeNull();
    expect(parseStat("")).toBeNull();
  });
});

describe("formatStat", () => {
  it("rounds and keeps the suffix", () => {
    expect(formatStat(parseStat("600+"), 312.6)).toBe("313+");
  });

  it("keeps separators for grouped numbers", () => {
    expect(formatStat(parseStat("2,153"), 2153)).toBe("2,153");
    expect(formatStat(parseStat("2,153"), 980.2)).toBe("980");
  });

  it("formats the start as zero", () => {
    expect(formatStat(parseStat("6"), 0)).toBe("0");
  });
});
