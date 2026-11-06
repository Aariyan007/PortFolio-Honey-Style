// Probe WebGL2 on a throwaway canvas before three.js touches the real one,
// so unsupported devices get the CSS fallback without three logging console errors.
export function canUseWebGL(doc = document, { forceFail = false } = {}) {
  if (forceFail) return false;
  try {
    const gl = doc.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
