import { describe, it, expect } from "vitest";
import { buildEdges, edgeLengths } from "./graph.js";
import { buildFormations } from "./formations.js";

describe("buildEdges", () => {
  it("links nearest neighbours and dedupes (exact small case)", () => {
    // x = 0, 1, 2, 10 on a line, k = 1
    const p = new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0, 10, 0, 0]);
    expect(Array.from(buildEdges(p, 4, 1))).toEqual([0, 1, 1, 2, 2, 3]);
  });

  it("has no self links, no duplicates, valid indices, at most count*k edges", () => {
    const count = 400;
    const { positions } = buildFormations(count, 9);
    const edges = buildEdges(positions[0], count, 3);
    expect(edges.length % 2).toBe(0);
    expect(edges.length / 2).toBeLessThanOrEqual(count * 3);
    const keys = new Set();
    for (let e = 0; e < edges.length; e += 2) {
      const a = edges[e], b = edges[e + 1];
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(count);
      keys.add(`${a}-${b}`);
    }
    expect(keys.size).toBe(edges.length / 2);
  });

  it("rejects a positions array of the wrong length", () => {
    expect(() => buildEdges(new Float32Array(5), 2, 1)).toThrow(RangeError);
  });
});

describe("edgeLengths", () => {
  it("measures each edge in each formation", () => {
    const f0 = new Float32Array([0, 0, 0, 3, 4, 0]);
    const f1 = new Float32Array([0, 0, 0, 0, 0, 2]);
    const [l0, l1] = edgeLengths([f0, f1], new Uint32Array([0, 1]));
    expect(l0[0]).toBeCloseTo(5);
    expect(l1[0]).toBeCloseTo(2);
  });
});
