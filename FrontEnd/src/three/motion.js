// Frame-rate independent exponential approach: after t seconds, 1 - e^(-lambda*t) of the gap is closed.
export function damp(current, target, lambda, dt) {
  if (!(dt > 0)) return current;
  return target + (current - target) * Math.exp(-lambda * dt);
}

// Continuous progress p (0 = first formation, count-1 = last) -> the pair being blended.
export function splitProgress(p, count) {
  const last = count - 1;
  const c = Math.min(last, Math.max(0, p));
  const from = Math.min(last - 1, Math.floor(c));
  return { from, to: from + 1, mix: c - from };
}

// Per-formation value blended at progress p.
export function lerpTable(table, p) {
  const { from, to, mix } = splitProgress(p, table.length);
  return table[from] + (table[to] - table[from]) * mix;
}
