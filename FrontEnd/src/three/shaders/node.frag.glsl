uniform vec3 uColor;
uniform vec3 uHotColor;
uniform float uOpacity;
varying float vAlpha;
varying float vHot;
uniform vec2 uViewport;
uniform float uClear;
uniform float uClearHalf;
uniform float uDim;

// fade whatever falls in the centred content column so text stays readable
float readability() {
  float cx = abs(gl_FragCoord.x / uViewport.x - 0.5);
  float mask = 1.0 - smoothstep(uClearHalf * 0.7, uClearHalf * 1.1, cx);
  return uDim * (1.0 - uClear * mask);
}

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.5, d);
  float glow = pow(core, 3.0);
  vec3 col = mix(uColor, vec3(1.0, 0.95, 0.85), glow);
  col = mix(col, uHotColor, vHot * 0.6);
  gl_FragColor = vec4(col, (core * 0.6 + glow) * vAlpha * uOpacity * readability());
}
