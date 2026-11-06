import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineSegments,
  PerspectiveCamera, Points, Scene, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderer,
} from "three";
import { buildFormations, HELIX_SPLIT } from "./formations.js";
import { damp, splitProgress, lerpTable } from "./motion.js";
import { buildEdges, edgeLengths } from "./graph.js";
import common from "./shaders/common.glsl?raw";
import nodeVert from "./shaders/node.vert.glsl?raw";
import nodeFrag from "./shaders/node.frag.glsl?raw";
import edgeVert from "./shaders/edge.vert.glsl?raw";
import edgeFrag from "./shaders/edge.frag.glsl?raw";

const AMBER = new Color("#f59e0b");
const HOT = new Color("#ff3b30");
const PROJECTS = 3;
const EXPERIENCE = 2;
const FORMATIONS = 5;

// per formation (hero, about, experience, projects, contact)
const SPIN = [0.06, 0.12, 0.3, 0.05, 0.15]; // rad/s about the shape's own vertical axis
const TILT = [1.12, 0.25, 0, 0.5, 0]; // rad about x
const DIM = [1, 0.85, 0.8, 0.75, 0.9]; // overall brightness
const CLEAR = [0.5, 0.7, 0.85, 0.8, 0.65]; // how much the centre content column is faded
const MORPH_RATE = 1.1; // 1/s: a section change takes ~2.5 s to settle
const CONTENT_HALF_PX = 560; // half of the 1100px content column, plus a margin
const FOV_TAN = Math.tan((50 / 2) * (Math.PI / 180));
export default class NeuralScene {
  constructor(canvas, { nodeCount = 1400, dpr = 1, animate = true, seed = 7 } = {}) {
    // throws if WebGL is unavailable — NeuralCanvas catches and shows the fallback
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);

    this.animate = animate;
    this.nodeCount = nodeCount;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(50, 1, 0.1, 50);
    this.camera.position.set(0, 0, 8);
    this.group = new Group();
    this.scene.add(this.group);

    this.formation = { from: 0, to: 1, mix: 0 };
    this.progress = 0;
    this.target = 0;
    this.highlight = { cluster: -1, amount: 0, target: 0 };
    this.pointerTarget = { x: 0, y: 0 };
    this.px = 0;
    this.py = 0;
    this.running = false;
    this.rafId = 0;
    this.lastTime = 0;
    this.onFrame = null;
    this.tmp = new Vector3();

    this.uniforms = {
      uTime: { value: 0 },
      uMix: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 1 },
      uPointer: { value: new Vector3(99, 99, 0) },
      uPointerStrength: { value: animate ? 1 : 0 },
      uLayout: { value: SPIN.map((spin, i) => new Vector4(i === EXPERIENCE ? HELIX_SPLIT : 0, animate ? spin : 0, TILT[i], 0)) },
      uViewport: { value: new Vector2(1, 1) },
      uClear: { value: CLEAR[0] },
      uClearHalf: { value: 0.5 },
      uDim: { value: DIM[0] },
    };
    this.nodeUniforms = {
      uPixelRatio: { value: dpr },
      uHighlight: { value: -1 },
      uHighlightAmount: { value: 0 },
    };

    const { positions, clusters, seeds } = buildFormations(nodeCount, seed);
    this.#buildNodes(positions, clusters, seeds);
    this.#buildEdges(positions, seeds);

    this.resize();
    this.render(0);
  }

  #material(vertex, fragment, extra) {
    return new ShaderMaterial({
      uniforms: { ...this.uniforms, ...extra },
      vertexShader: common + "\n" + vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }

  #buildNodes(positions, clusters, seeds) {
    const g = new BufferGeometry();
    positions.forEach((p, f) => g.setAttribute(`aPos${f}`, new BufferAttribute(p, 3)));
    g.setAttribute("position", new BufferAttribute(positions[0], 3));
    g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    g.setAttribute("aCluster", new BufferAttribute(clusters, 1));
    const make = (size, opacity) =>
      this.#material(nodeVert, nodeFrag, {
        ...this.nodeUniforms,
        uSize: { value: size },
        uColor: { value: AMBER },
        uHotColor: { value: HOT },
        uOpacity: { value: opacity },
      });
    this.nodes = new Points(g, make(90, 1));
    this.halo = new Points(g, make(260, 0.12));
    for (const o of [this.halo, this.nodes]) {
      o.frustumCulled = false; // the shader moves vertices; CPU bounds are meaningless
      this.group.add(o);
    }
  }

  #buildEdges(positions, seeds) {
    const edges = buildEdges(positions[0], this.nodeCount, 3);
    const lengths = edgeLengths(positions, edges);
    const edgeCount = edges.length / 2;
    const vCount = edgeCount * 2;
    const pos = positions.map(() => new Float32Array(vCount * 3));
    const seed = new Float32Array(vCount);
    const end = new Float32Array(vCount);
    const phase = new Float32Array(vCount);
    const lenA = new Float32Array(vCount * 4);
    const lenB = new Float32Array(vCount);
    for (let e = 0; e < edgeCount; e++) {
      const a = edges[e * 2], b = edges[e * 2 + 1];
      const ph = (seeds[a] * 7.31 + seeds[b] * 3.17) % 1;
      for (let s = 0; s < 2; s++) {
        const v = e * 2 + s;
        const n = s === 0 ? a : b;
        positions.forEach((p, f) => {
          pos[f][v * 3] = p[n * 3];
          pos[f][v * 3 + 1] = p[n * 3 + 1];
          pos[f][v * 3 + 2] = p[n * 3 + 2];
        });
        seed[v] = seeds[n];
        end[v] = s;
        phase[v] = ph;
        for (let f = 0; f < 4; f++) lenA[v * 4 + f] = lengths[f][e];
        lenB[v] = lengths[4][e];
      }
    }
    const g = new BufferGeometry();
    pos.forEach((p, f) => g.setAttribute(`aPos${f}`, new BufferAttribute(p, 3)));
    g.setAttribute("position", new BufferAttribute(pos[0], 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    g.setAttribute("aEnd", new BufferAttribute(end, 1));
    g.setAttribute("aPhase", new BufferAttribute(phase, 1));
    g.setAttribute("aLenA", new BufferAttribute(lenA, 4));
    g.setAttribute("aLenB", new BufferAttribute(lenB, 1));
    this.edges = new LineSegments(g, this.#material(edgeVert, edgeFrag, {
      uColor: { value: AMBER },
      uOpacity: { value: 1 },
    }));
    this.edges.frustumCulled = false;
    this.group.add(this.edges);
    this.edgeVertexCount = vCount;
  }

  // p: 0 = hero … 4 = contact, fractional mid-transition. The scene eases toward it.
  setProgress(p) {
    this.target = p;
    if (!this.animate) {
      this.progress = p;
      this.#applyProgress();
      this.render(0);
    }
  }

  #applyProgress() {
    const p = this.progress;
    const f = splitProgress(p, FORMATIONS);
    this.formation = f;
    this.uniforms.uFrom.value = f.from;
    this.uniforms.uTo.value = f.to;
    this.uniforms.uMix.value = f.mix;
    this.uniforms.uDim.value = lerpTable(DIM, p);
    this.uniforms.uClear.value = lerpTable(CLEAR, p);
    this.camera.position.z = 8 - p * 0.25;
  }

  setPointer(ndcX, ndcY) {
    this.pointerTarget.x = ndcX;
    this.pointerTarget.y = ndcY;
    // ray through the pointer, intersected with the world z = 0 plane
    const dir = this.tmp.set(ndcX, ndcY, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    const t = -this.camera.position.z / dir.z;
    this.uniforms.uPointer.value.copy(this.camera.position).addScaledVector(dir, t);
    this.#renderIfStatic();
  }

  highlightCluster(index) {
    if (index === null || index === undefined || index < 0) {
      this.highlight.target = 0;
    } else {
      this.highlight.cluster = index;
      this.highlight.target = 1;
    }
    this.#renderIfStatic();
  }

  setQuality(tier) {
    const low = tier === "low";
    this.halo.visible = !low;
    this.nodes.geometry.setDrawRange(0, low ? Math.ceil(this.nodeCount / 2) : Infinity);
    this.edges.geometry.setDrawRange(0, low ? Math.floor(this.edgeVertexCount / 4) * 2 : Infinity);
    if (low) {
      this.renderer.setPixelRatio(1);
      this.nodeUniforms.uPixelRatio.value = 1;
      this.resize();
    }
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.getDrawingBufferSize(this.uniforms.uViewport.value);
    const clearHalf = Math.min(0.5, CONTENT_HALF_PX / w);
    this.uniforms.uClearHalf.value = clearHalf;
    // park the helices in the middle of the free margin beside the content column
    const halfW = (8 - EXPERIENCE * 0.25) * FOV_TAN * this.camera.aspect;
    const marginX = ((clearHalf * 2 + 1) / 2) * halfW;
    this.uniforms.uLayout.value[EXPERIENCE].w = Math.max(0, marginX - HELIX_SPLIT);
    this.#renderIfStatic();
  }

  start() {
    if (this.running || !this.animate) return;
    this.running = true;
    this.lastTime = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      const raw = now - this.lastTime;
      this.lastTime = now;
      this.render(Math.min(raw, 100));
      this.onFrame?.(raw);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  resume() {
    this.start();
  }

  render(dtMs = 0) {
    const dt = dtMs / 1000;
    if (this.animate) {
      this.uniforms.uTime.value += dt;
      this.progress = damp(this.progress, this.target, MORPH_RATE, dt);
    }
    this.#applyProgress();
    const { from, to, mix } = this.formation;
    const k = this.animate ? Math.min(1, dt * 3) : 1;
    this.px += (this.pointerTarget.x * 0.15 - this.px) * k;
    this.py += (this.pointerTarget.y * 0.15 - this.py) * k;
    this.group.rotation.set(-this.py, this.px, 0);

    const h = this.highlight;
    h.amount += (h.target - h.amount) * (this.animate ? Math.min(1, dt * 6) : 1);
    const projectsWeight = from === PROJECTS ? 1 - mix : to === PROJECTS ? mix : 0;
    this.nodeUniforms.uHighlight.value = h.cluster;
    this.nodeUniforms.uHighlightAmount.value = h.amount * projectsWeight;

    this.renderer.render(this.scene, this.camera);
  }

  #renderIfStatic() {
    if (!this.animate) this.render(0);
  }

  dispose() {
    this.pause();
    this.nodes.material.dispose();
    this.halo.material.dispose();
    this.edges.material.dispose();
    this.nodes.geometry.dispose();
    this.edges.geometry.dispose();
    // no forceContextLoss(): StrictMode remounts reuse this same canvas
    this.renderer.dispose();
  }
}
