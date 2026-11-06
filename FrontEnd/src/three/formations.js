import { mulberry32, gaussian } from "./prng.js";

export const FORMATION_NAMES = ["hero", "about", "experience", "projects", "contact"];
export const PROJECT_CLUSTERS = 8;

function write(out, i, x, y, z) {
  out[i * 3] = x;
  out[i * 3 + 1] = y;
  out[i * 3 + 2] = z;
}

export const HELIX_SPLIT = 1.6; // each experience helix sits this far from x = 0 (the shader pushes them further apart)

// 0 · hero: three-arm spiral galaxy, flat in the xz plane (the shader tilts and spins it)
function galaxy(count, rand) {
  const out = new Float32Array(count * 3);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.14) {
      write(out, i, gaussian(rand) * 0.45, gaussian(rand) * 0.14, gaussian(rand) * 0.45);
      continue;
    }
    const r = 0.5 + Math.pow(rand(), 0.75) * 4.6;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const a = arm + r * 0.95 + gaussian(rand) * 0.22 / (0.4 + r * 0.25);
    const spread = gaussian(rand) * 0.12 * (0.6 + r * 0.15);
    write(out, i,
      Math.cos(a) * r + spread,
      gaussian(rand) * 0.07 * (1.6 - r * 0.2),
      Math.sin(a) * r + spread);
  }
  return out;
}

// 1 · about: (2,3) torus knot with a fuzzy tube
function torusKnot(count, rand) {
  const out = new Float32Array(count * 3);
  const s = 0.78;
  for (let i = 0; i < count; i++) {
    const t = rand() * Math.PI * 2;
    const r = Math.cos(3 * t) + 2;
    write(out, i,
      (r * Math.cos(2 * t)) * s + gaussian(rand) * 0.1,
      (r * Math.sin(2 * t)) * s + gaussian(rand) * 0.1,
      -Math.sin(3 * t) * s + gaussian(rand) * 0.1);
  }
  return out;
}

// 2 · experience: two double helices flanking the centre, leaving the content column clear
function twinHelix(count, rand) {
  const out = new Float32Array(count * 3);
  const turns = 3, height = 7.4, radius = 0.62;
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = rand();
    const angle = t * turns * Math.PI * 2 + (side > 0 ? Math.PI / 2 : 0);
    const y = (t - 0.5) * height;
    const cx = side * HELIX_SPLIT;
    if (rand() < 0.86) {
      const strand = (i >> 1) % 2 === 0 ? 0 : Math.PI;
      write(out, i,
        cx + Math.cos(angle + strand) * radius + gaussian(rand) * 0.04,
        y,
        Math.sin(angle + strand) * radius + gaussian(rand) * 0.04);
    } else {
      const k = rand() * 2 - 1;
      write(out, i, cx + Math.cos(angle) * radius * k, y, Math.sin(angle) * radius * k);
    }
  }
  return out;
}

// 3 · projects: 8 clusters orbiting on a ring in the xz plane + dust; fills `clusters`
function constellation(count, rand, clusters) {
  const out = new Float32Array(count * 3);
  const centres = Array.from({ length: PROJECT_CLUSTERS }, (_, k) => {
    const a = (k / PROJECT_CLUSTERS) * Math.PI * 2;
    return [Math.cos(a) * 3.4, (rand() - 0.5) * 0.5, Math.sin(a) * 3.4];
  });
  let assigned = 0;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.75) {
      const k = assigned++ % PROJECT_CLUSTERS; // round-robin guarantees every cluster gets nodes
      const c = centres[k];
      write(out, i, c[0] + gaussian(rand) * 0.26, c[1] + gaussian(rand) * 0.26, c[2] + gaussian(rand) * 0.26);
      clusters[i] = k;
    } else {
      const a = rand() * Math.PI * 2;
      const r = 3.4 + gaussian(rand) * 0.9;
      write(out, i, Math.cos(a) * r, gaussian(rand) * 0.25, Math.sin(a) * r);
      clusters[i] = -1;
    }
  }
  return out;
}

// 4 · contact: core sphere + 3 tilted rings
function beacon(count, rand) {
  const out = new Float32Array(count * 3);
  const tilt = 1.1, cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  const radii = [1.2, 2.0, 2.8];
  for (let i = 0; i < count; i++) {
    if (rand() < 0.4) {
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      const r = Math.cbrt(rand()) * 0.4;
      write(out, i, r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
    } else {
      const r = radii[i % radii.length] + gaussian(rand) * 0.04;
      const a = rand() * Math.PI * 2;
      const rx = Math.cos(a) * r, rz = Math.sin(a) * r;
      write(out, i, rx, -rz * sinT, rz * cosT); // ring plane rotated about x
    }
  }
  return out;
}

export function buildFormations(count, seed = 7) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError(`count must be a positive integer, got ${count}`);
  }
  const rand = mulberry32(seed);
  const clusters = new Float32Array(count).fill(-1);
  const positions = [
    galaxy(count, rand),
    torusKnot(count, rand),
    twinHelix(count, rand),
    constellation(count, rand, clusters),
    beacon(count, rand),
  ];
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = rand();
  return { positions, clusters, seeds };
}
