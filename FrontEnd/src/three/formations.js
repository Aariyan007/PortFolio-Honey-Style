import { mulberry32, gaussian } from "./prng.js";

export const FORMATION_NAMES = ["hero", "about", "experience", "projects", "contact"];
export const PROJECT_CLUSTERS = 8;

function write(out, i, x, y, z) {
  out[i * 3] = x;
  out[i * 3 + 1] = y;
  out[i * 3 + 2] = z;
}

// 0 · hero: 6 gaussian clusters joined by sparse filaments
function cloud(count, rand) {
  const centres = Array.from({ length: 6 }, () => [
    (rand() - 0.5) * 7,
    (rand() - 0.5) * 3.6,
    (rand() - 0.5) * 3,
  ]);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (rand() < 0.8) {
      const c = centres[i % centres.length];
      write(out, i, c[0] + gaussian(rand) * 0.55, c[1] + gaussian(rand) * 0.45, c[2] + gaussian(rand) * 0.55);
    } else {
      const a = centres[Math.floor(rand() * centres.length)];
      const b = centres[Math.floor(rand() * centres.length)];
      const t = rand();
      write(
        out, i,
        a[0] + (b[0] - a[0]) * t + gaussian(rand) * 0.08,
        a[1] + (b[1] - a[1]) * t + gaussian(rand) * 0.08,
        a[2] + (b[2] - a[2]) * t + gaussian(rand) * 0.08,
      );
    }
  }
  return out;
}

// 1 · about: noisy Fibonacci shell, stretched into two hemispheres
function brain(count, rand) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const r = 2.2 * (1 + (rand() - 0.5) * 0.24);
    let x = Math.cos(theta) * ring * r * 1.2;
    x += (x >= 0 ? 1 : -1) * 0.18; // fissure between hemispheres
    write(out, i, x, y * r * 0.95, Math.sin(theta) * ring * r);
  }
  return out;
}

// 2 · experience: vertical double helix with rungs
function helix(count, rand) {
  const out = new Float32Array(count * 3);
  const turns = 3.5, height = 7, radius = 1.1;
  for (let i = 0; i < count; i++) {
    const t = rand();
    const angle = t * turns * Math.PI * 2;
    const y = (t - 0.5) * height;
    if (rand() < 0.85) {
      const strand = i % 2 === 0 ? 0 : Math.PI;
      write(out, i,
        Math.cos(angle + strand) * radius + gaussian(rand) * 0.06,
        y,
        Math.sin(angle + strand) * radius + gaussian(rand) * 0.06);
    } else {
      const s = rand() * 2 - 1;
      write(out, i, Math.cos(angle) * radius * s, y, Math.sin(angle) * radius * s);
    }
  }
  return out;
}

// 3 · projects: 8 clusters on an ellipse + dust; fills `clusters`
function constellation(count, rand, clusters) {
  const out = new Float32Array(count * 3);
  const centres = Array.from({ length: PROJECT_CLUSTERS }, (_, k) => {
    const a = (k / PROJECT_CLUSTERS) * Math.PI * 2;
    return [Math.cos(a) * 3.4, Math.sin(a) * 1.8, (rand() - 0.5) * 1.5];
  });
  let assigned = 0;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.75) {
      const k = assigned++ % PROJECT_CLUSTERS; // round-robin guarantees every cluster gets nodes
      const c = centres[k];
      write(out, i, c[0] + gaussian(rand) * 0.28, c[1] + gaussian(rand) * 0.28, c[2] + gaussian(rand) * 0.28);
      clusters[i] = k;
    } else {
      write(out, i, (rand() - 0.5) * 9, (rand() - 0.5) * 5, (rand() - 0.5) * 4);
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
    cloud(count, rand),
    brain(count, rand),
    helix(count, rand),
    constellation(count, rand, clusters),
    beacon(count, rand),
  ];
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = rand();
  return { positions, clusters, seeds };
}
