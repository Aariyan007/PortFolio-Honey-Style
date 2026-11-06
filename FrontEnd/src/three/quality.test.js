import { describe, it, expect } from "vitest";
import { createQualityMonitor } from "./quality.js";

const feed = (m, ms, n) => {
  for (let i = 0; i < n; i++) m.sample(ms);
};

describe("createQualityMonitor", () => {
  it("stays high when frames are fast", () => {
    const m = createQualityMonitor();
    feed(m, 16, 500);
    expect(m.tier).toBe("high");
  });

  it("drops to low once the window average exceeds the threshold", () => {
    const m = createQualityMonitor({ windowSize: 120 });
    feed(m, 30, 119);
    expect(m.tier).toBe("high"); // window not full yet
    m.sample(30);
    expect(m.tier).toBe("low");
  });

  it("never climbs back to high", () => {
    const m = createQualityMonitor({ windowSize: 10 });
    feed(m, 40, 10);
    feed(m, 5, 1000);
    expect(m.tier).toBe("low");
  });

  it("ignores spikes from a hidden tab and junk samples", () => {
    const m = createQualityMonitor({ windowSize: 10 });
    feed(m, 16, 9);
    m.sample(5000); // tab came back after 5 s
    m.sample(Number.NaN);
    m.sample(-3);
    m.sample(16);
    expect(m.tier).toBe("high");
  });
});

describe("createQualityMonitor warm-up", () => {
  it("ignores slow boot frames until warmupMs of frame time has passed", () => {
    const m = createQualityMonitor({ windowSize: 10, warmupMs: 1000 });
    feed(m, 200, 5); // 1000 ms of janky boot frames, all inside warm-up
    feed(m, 16, 10);
    expect(m.tier).toBe("high");
  });

  it("still downgrades on sustained slowness after warm-up", () => {
    const m = createQualityMonitor({ windowSize: 10, warmupMs: 100 });
    feed(m, 30, 20);
    expect(m.tier).toBe("low");
  });
});
