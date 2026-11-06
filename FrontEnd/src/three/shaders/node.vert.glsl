attribute float aCluster;
uniform float uSize;
uniform float uSizeScale;
uniform float uPixelRatio;
uniform float uHighlight;
uniform float uHighlightAmount;
varying float vAlpha;
varying float vHot;

void main() {
  vec4 mv = viewMatrix * vec4(nodeWorld(aSeed), 1.0);
  gl_Position = projectionMatrix * mv;
  float hl = (uHighlight >= 0.0 && abs(aCluster - uHighlight) < 0.5) ? uHighlightAmount : 0.0;
  gl_PointSize = uSize * uSizeScale * uPixelRatio * (0.6 + aSeed * 0.8) * (1.0 + hl * 1.8) / -mv.z;
  vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + aSeed * 60.0);
  vHot = hl;
}
