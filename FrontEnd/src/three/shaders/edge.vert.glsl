attribute float aEnd;
attribute float aPhase;
attribute vec4 aLenA;
attribute float aLenB;
varying float vT;
varying float vPhase;
varying float vFade;

float lenAt(float i) {
  if (i < 0.5) return aLenA.x;
  if (i < 1.5) return aLenA.y;
  if (i < 2.5) return aLenA.z;
  if (i < 3.5) return aLenA.w;
  return aLenB;
}

void main() {
  gl_Position = projectionMatrix * viewMatrix * vec4(nodeWorld(aSeed), 1.0);
  float len = mix(lenAt(uFrom), lenAt(uTo), smoothstep(0.0, 1.0, uMix));
  vFade = 1.0 - smoothstep(0.3, 1.6, len);
  vT = aEnd;
  vPhase = aPhase;
}
