import { describe, it, expect, vi } from "vitest";
import { canUseWebGL } from "./webgl.js";

const fakeDoc = (ctx) => {
  const lose = vi.fn();
  const gl = ctx && { getExtension: (n) => (n === "WEBGL_lose_context" ? { loseContext: lose } : null) };
  const getContext = vi.fn(() => gl);
  return { doc: { createElement: () => ({ getContext }) }, getContext, lose };
};

describe("canUseWebGL", () => {
  it("is true when a webgl2 context can be created, and releases the probe context", () => {
    const { doc, getContext, lose } = fakeDoc(true);
    expect(canUseWebGL(doc)).toBe(true);
    expect(getContext).toHaveBeenCalledWith("webgl2", expect.objectContaining({ failIfMajorPerformanceCaveat: true }));
    expect(lose).toHaveBeenCalledTimes(1);
  });

  it("is false when webgl2 is unavailable", () => {
    expect(canUseWebGL(fakeDoc(false).doc)).toBe(false);
  });

  it("is false when getContext throws", () => {
    const doc = { createElement: () => ({ getContext: () => { throw new Error("blocked"); } }) };
    expect(canUseWebGL(doc)).toBe(false);
  });

  it("is false without probing when forced off", () => {
    const { doc, getContext } = fakeDoc(true);
    expect(canUseWebGL(doc, { forceFail: true })).toBe(false);
    expect(getContext).not.toHaveBeenCalled();
  });
});
