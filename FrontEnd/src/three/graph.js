// k-nearest-neighbour edges, brute force. 1400 nodes ≈ 2M distance checks ≈ 20 ms, run once.
export function buildEdges(positions, count, k = 3) {
  if (positions.length !== count * 3) {
    throw new RangeError(`positions length ${positions.length} must equal count * 3 (${count * 3})`);
  }
  const seen = new Set();
  const pairs = [];
  for (let i = 0; i < count; i++) {
    const ix = positions[i * 3], iy = positions[i * 3 + 1], iz = positions[i * 3 + 2];
    const nearest = []; // [distSq, j], sorted ascending, length <= k
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix, dy = positions[j * 3 + 1] - iy, dz = positions[j * 3 + 2] - iz;
      const d = dx * dx + dy * dy + dz * dz;
      if (nearest.length < k || d < nearest[nearest.length - 1][0]) {
        nearest.push([d, j]);
        nearest.sort((a, b) => a[0] - b[0]);
        if (nearest.length > k) nearest.pop();
      }
    }
    for (const [, j] of nearest) {
      const a = Math.min(i, j), b = Math.max(i, j);
      const key = a * count + b;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push(a, b);
      }
    }
  }
  return Uint32Array.from(pairs);
}

export function edgeLengths(positionsList, edges) {
  const n = edges.length / 2;
  return positionsList.map((p) => {
    const out = new Float32Array(n);
    for (let e = 0; e < n; e++) {
      const a = edges[e * 2] * 3, b = edges[e * 2 + 1] * 3;
      out[e] = Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1], p[a + 2] - p[b + 2]);
    }
    return out;
  });
}
