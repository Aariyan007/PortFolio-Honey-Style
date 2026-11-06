// Drops to "low" once the mean frame time over a full window exceeds the threshold.
// One-way by design: flapping between tiers looks worse than staying low.
export function createQualityMonitor({ thresholdMs = 22, windowSize = 120, maxSampleMs = 250 } = {}) {
  let tier = "high";
  const samples = [];
  let sum = 0;
  return {
    sample(dtMs) {
      // NaN, negatives and hidden-tab gaps say nothing about rendering cost
      if (tier === "low" || !(dtMs > 0) || dtMs > maxSampleMs) return tier;
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
