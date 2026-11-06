uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
varying float vT;
varying float vPhase;
varying float vFade;
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
  float head = fract(uTime * 0.35 + vPhase);
  float pulse = 1.0 - smoothstep(0.0, 0.08, abs(vT - head));
  vec3 col = mix(uColor, vec3(1.0, 0.92, 0.8), pulse);
  gl_FragColor = vec4(col, vFade * (0.18 + pulse * 0.8) * uOpacity * readability());
}
