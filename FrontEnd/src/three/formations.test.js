import { describe, it, expect } from "vitest";
import { buildFormations, FORMATION_NAMES, PROJECT_CLUSTERS, HELIX_SPLIT } from "./formations.js";
import { mulberry32 } from "./prng.js";

describe("mulberry32", () => {
  it("returns values in [0, 1) deterministically", () => {
    const a = mulberry32(5), b = mulberry32(5);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(v).toBe(b());
    }
  });
});

describe("buildFormations", () => {
  it("returns one count*3 array of finite floats per formation", () => {
    const { positions } = buildFormations(500, 1);
    expect(positions).toHaveLength(FORMATION_NAMES.length);
    for (const p of positions) {
      expect(p).toHaveLength(1500);
      expect(p.every(Number.isFinite)).toBe(true);
    }
  });

  it("is deterministic for a seed and differs across seeds", () => {
    const a = buildFormations(200, 42);
    const b = buildFormations(200, 42);
    const c = buildFormations(200, 43);
    expect(Array.from(a.positions[0])).toEqual(Array.from(b.positions[0]));
    expect(Array.from(a.positions[0])).not.toEqual(Array.from(c.positions[0]));
  });

  it("uses all 8 project clusters and marks dust as -1", () => {
    const { clusters } = buildFormations(1400, 7);
    const values = Array.from(clusters);
    expect(new Set(values.filter((c) => c >= 0)).size).toBe(PROJECT_CLUSTERS);
    expect(values.every((c) => c === -1 || (Number.isInteger(c) && c < PROJECT_CLUSTERS))).toBe(true);
  });

  it("also covers all clusters at the mobile count", () => {
    const { clusters } = buildFormations(500, 7);
    expect(new Set(Array.from(clusters).filter((c) => c >= 0)).size).toBe(PROJECT_CLUSTERS);
  });

  it("gives every node a seed in [0, 1)", () => {
    const { seeds } = buildFormations(300, 3);
    expect(Array.from(seeds).every((s) => s >= 0 && s < 1)).toBe(true);
  });

  it("handles a single node", () => {
    const { positions } = buildFormations(1, 7);
    for (const p of positions) expect(p.every(Number.isFinite)).toBe(true);
  });

  it("hero is a thin disc in the xz plane (tilted later in the shader)", () => {
    const p = buildFormations(1400, 7).positions[0];
    let maxY = 0, maxR = 0;
    for (let i = 0; i < 1400; i++) {
      maxY = Math.max(maxY, Math.abs(p[i * 3 + 1]));
      maxR = Math.max(maxR, Math.hypot(p[i * 3], p[i * 3 + 2]));
    }
    expect(maxR).toBeGreaterThan(3);
    expect(maxY).toBeLessThan(maxR * 0.25);
  });

  it("experience is two helices, one each side of x = 0, clear of the centre", () => {
    const p = buildFormations(1400, 7).positions[2];
    let left = 0, right = 0;
    for (let i = 0; i < 1400; i++) {
      const x = p[i * 3];
      expect(Math.abs(x)).toBeGreaterThan(HELIX_SPLIT - 1);
      if (x < 0) left++; else right++;
    }
    expect(Math.min(left, right)).toBeGreaterThan(600);
  });

  it("rejects bad counts", () => {
    expect(() => buildFormations(0)).toThrow(RangeError);
    expect(() => buildFormations(-5)).toThrow(RangeError);
    expect(() => buildFormations(10.5)).toThrow(RangeError);
  });
});
