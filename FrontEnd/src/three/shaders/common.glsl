uniform float uTime;
uniform float uMix;
uniform float uFrom;
uniform float uTo;
uniform vec3 uPointer;
uniform float uPointerStrength;

attribute vec3 aPos0;
attribute vec3 aPos1;
attribute vec3 aPos2;
attribute vec3 aPos3;
attribute vec3 aPos4;
attribute float aSeed;

vec3 formation(float i) {
  if (i < 0.5) return aPos0;
  if (i < 1.5) return aPos1;
  if (i < 2.5) return aPos2;
  if (i < 3.5) return aPos3;
  return aPos4;
}

// per-node stagger so the morph ripples instead of moving in lockstep
float stagger(float m, float seed) {
  return smoothstep(0.0, 1.0, clamp(m * 1.4 - seed * 0.4, 0.0, 1.0));
}

vec3 nodeWorld(float seed) {
  vec3 p = mix(formation(uFrom), formation(uTo), stagger(uMix, seed));
  p += 0.06 * vec3(
    sin(uTime * 0.6 + seed * 40.0),
    cos(uTime * 0.5 + seed * 31.0),
    sin(uTime * 0.4 + seed * 17.0));
  vec4 world = modelMatrix * vec4(p, 1.0);
  vec2 d = world.xy - uPointer.xy;
  float push = 1.0 - smoothstep(0.0, 1.2, length(d));
  world.xy += normalize(d + 1e-4) * push * push * 0.35 * uPointerStrength;
  return world.xyz;
}
