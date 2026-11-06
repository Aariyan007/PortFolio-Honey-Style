// Transition i (formation i → i+1) runs while section i+1's top moves
// from the viewport bottom up to 30% of the viewport height.
// A missing section has top = Infinity and is skipped.
export function resolveFormation(scrollY, viewportH, tops) {
  if (tops.length < 2) return { from: 0, to: 0, mix: 0 };
  for (let i = tops.length - 2; i >= 0; i--) {
    const start = tops[i + 1] - viewportH;
    const end = tops[i + 1] - viewportH * 0.3;
    if (Number.isFinite(start) && scrollY >= start) {
      const span = end - start;
      const mix = span > 0 ? Math.min(1, (scrollY - start) / span) : 1;
      return { from: i, to: i + 1, mix };
    }
  }
  return { from: 0, to: 1, mix: 0 };
}
