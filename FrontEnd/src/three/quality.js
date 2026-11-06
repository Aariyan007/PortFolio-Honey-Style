// Drops to "low" once the mean frame time over a full window exceeds the threshold.
// One-way by design: flapping between tiers looks worse than staying low.
// warmupMs: frame time to ignore at boot (loader, ScrollSmoother/SplitText setup) before judging.
export function createQualityMonitor({ thresholdMs = 22, windowSize = 120, maxSampleMs = 250, warmupMs = 0 } = {}) {
  let tier = "high";
  const samples = [];
  let sum = 0;
  let warmed = 0;
  return {
    sample(dtMs) {
      // NaN, negatives and hidden-tab gaps say nothing about rendering cost
      if (tier === "low" || !(dtMs > 0) || dtMs > maxSampleMs) return tier;
      if (warmed < warmupMs) {
        warmed += dtMs;
        return tier;
      }
      samples.push(dtMs);
      sum += dtMs;
      if (samples.length > windowSize) sum -= samples.shift();
      if (samples.length === windowSize && sum / windowSize > thresholdMs) tier = "low";
      return tier;
    },
    get tier() {
      return tier;
    },
  };
}
