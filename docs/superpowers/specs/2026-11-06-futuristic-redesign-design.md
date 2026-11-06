# Futuristic Redesign — Design Spec

Date: 2026-11-06
Branch: `feat/futuristic-redesign`
App: `FrontEnd/` (React 19 + Vite 8 + GSAP 3 + Tailwind 4)

## 1. Intent

**What the user asked for:** the current UI feels bland. Add more effects and a futuristic Three.js animation, make the site faster, and fill the projects section from the user's GitHub (`Aariyan007`).

**Decisions made in brainstorming:**

| Topic | Decision |
|---|---|
| Visual direction | Keep the dark base and amber/orange identity; layer futuristic effects on top |
| 3D concept | Neural network graph (nodes + edges + travelling data pulses) |
| 3D architecture | One persistent full-page canvas; the graph re-forms per section |
| Projects | 8 featured cards + a filterable archive list, data baked in at build time |
| Contact section | Stays dark; drop the current dark→light page flip |
| Tests | Add `vitest` for pure logic only |

**Success criteria**

1. The graph renders behind every section and morphs between 5 formations as the user scrolls.
2. Initial transfer is about 300 KB (fonts excluded), down from about 8.2 MB today.
3. 60 fps on desktop; at least 45 fps on a mid-range phone. Adaptive quality kicks in below that.
4. Every project link points at a real repo; no `REPO-NAME` placeholders remain.
5. `vite build`, `eslint .` and `vitest run` pass. The browser shows zero console errors on desktop and at a 375 px viewport.

**Non-goals:** a multi-page router, a CMS, runtime GitHub API calls, changes to the About or Experience copy.

## 2. Architecture

```
FrontEnd/src/
  three/
    NeuralScene.js      plain three.js class: renderer, camera, points, lines, RAF loop
    formations.js       pure functions: (count, seed) -> Float32Array positions, one per formation
    graph.js            pure: nearest-neighbour edge builder -> index pairs
    quality.js          pure: frame-time sampler -> quality tier decision
    shaders/
      node.vert.glsl  node.frag.glsl
      edge.vert.glsl  edge.frag.glsl
  components/
    NeuralCanvas.jsx    React wrapper: lazy import of three/NeuralScene, wires ScrollTrigger -> scene
    Hud.jsx             corner brackets, cursor coords, section index, IST clock
    DecodeText.jsx      ScrambleTextPlugin wrapper (on-enter and on-hover)
    ProjectArchive.jsx  filter chips + archive rows
  data/
    projects.js         FEATURED[] and ARCHIVE[] (moved out of Projects.jsx)
```

**Separation rule:** `NeuralScene` knows nothing about React or the DOM sections. Its API is the only boundary:

```js
const scene = new NeuralScene(canvas, { nodeCount, dpr });
scene.setFormation(fromIndex, toIndex, mix);   // mix in [0, 1]
scene.setPointer(ndcX, ndcY);                  // -1..1
scene.highlightCluster(clusterIndex | null);   // projects formation only
scene.setQuality(tier);                        // 'high' | 'low'
scene.pause(); scene.resume(); scene.dispose();
```

`NeuralCanvas.jsx` owns every ScrollTrigger and DOM listener and calls only this API.

### 2.1 Loading

- `three` sits behind `import('../three/NeuralScene')`, so it gets its own chunk.
- The import starts as soon as the loader mounts. The scene fades in when the loader finishes.
- If WebGL context creation throws, `NeuralCanvas` renders the CSS fallback (a radial amber glow on `#0a0a0a`) and logs one `console.warn`.

### 2.2 Graph rendering

- **Nodes:** a `THREE.Points` with a custom `ShaderMaterial`. Each node is a soft glowing disc with additive blending: amber `#f59e0b` core, white-hot centre, size attenuated by depth.
  - Count: 1400 on desktop, 500 when `(hover: none)` or `innerWidth < 768`.
- **Edges:** a `THREE.LineSegments`. `graph.js` links each node to its k = 3 nearest neighbours in the **hero** formation, and the same pairs are reused in every formation.
  - Edge alpha fades with current length, so stretched edges vanish naturally.
- **Pulses:** a per-edge `aPhase` attribute. The edge fragment shader draws a bright moving segment at `fract(uTime * speed + aPhase)`. No per-frame CPU work.
- **Glow:** additive blending plus a larger, faint halo sprite pass. No post-processing.

### 2.3 Formations

Each formation is a `Float32Array(count * 3)` attribute: `aPos0` … `aPos4`. The vertex shader picks the pair `uFrom` / `uTo` and mixes them with `smoothstep(uMix)`. It also adds a small curl-noise drift and cursor repulsion (pointer projected onto the z = 0 plane, radius 1.2, falloff squared).

| # | Section | Shape |
|---|---|---|
| 0 | Hero | Loose neural cloud: 6 Gaussian clusters joined by sparse filaments; slow Y rotation |
| 1 | About | Noisy Fibonacci sphere shell ("brain"), radius 2.2 |
| 2 | Experience | Vertical double helix, offset to the timeline side of the screen |
| 3 | Projects | Constellation: 8 tight clusters (one per featured project) plus scattered dust |
| 4 | Contact | Collapse to a core sphere (r = 0.4) plus 3 expanding rings |

All generators use a seeded PRNG (mulberry32), so output is deterministic and testable.

### 2.4 Scroll and interaction wiring

- One `gsap.ticker` callback reads the (smoothed) scroll position and maps it through the pure `resolveFormation(scrollY, viewportH, sectionTops)`. Transition i runs while section i+1's top moves from the viewport bottom to 30% height. It calls `setFormation(from, to, mix)` only when the value changes. Section tops are re-measured on every ScrollTrigger refresh.
- The camera dollies slightly with page progress. Pointer parallax rotates the group ±0.15 rad via `gsap.quickTo`.
- Hovering a featured card calls `highlightCluster(i)`. The cluster's nodes scale up and brighten through a `uHighlight` uniform plus a per-node `aCluster` attribute.
- **Visibility:** `document.visibilitychange` → `pause()` / `resume()`.

## 3. UI and effects

**Palette tokens** (`styles/theme.css`):
- `--color-accent: #f59e0b`
- `--color-accent-secondary: #ff8c42`
- `--color-hot: #ff3b30` (highlights only)
- The RGB variants stay.

| Area | Change |
|---|---|
| Loader | Boot sequence: greeting → `initializing neural graph… NN%` (real progress = three chunk + first frame) → reveal |
| Hero | Remove `<video>`; the canvas shows through. The headline keeps its line reveal and SplitText hover bounce (scrambling would break the split). The edge label decodes. HUD brackets replace the hero frame corners |
| HUD (`Hud.jsx`) | Fixed overlay: corner brackets, cursor `X:0412 Y:0288`, `02 / ABOUT` section index, IST clock. Hidden < 768 px except the section index |
| Decode text | Eyebrows, labels and nav links scramble-decode on enter and on hover. Multi-line section titles keep their existing reveal |
| Cursor | Reticle + lagging ring; snaps to `[data-magnetic]` elements via the existing `useMagnetic` |
| Navbar | Blurred glass pill; a sliding indicator under the active section |
| Cards | Glass panel, animated conic holographic border on hover; the existing spotlight and tilt stay |
| Experience | Timeline thread fills and glows with scroll progress; each node lights up as it passes centre |
| Contact | Dark throughout; `> send_message` terminal line types in; magnetic email button over the beacon |
| Overlay | Subtle scanlines (CSS repeating-linear-gradient, 3% opacity) over the existing grain |

## 4. Projects data

`src/data/projects.js` exports `FEATURED` (8) and `ARCHIVE`. Each entry looks like this:

```js
{ id, title, subtitle, year, status, description, longDescription?, tags[], href, live?, accent, category, metrics?[] }
```

`category` is one of `ai`, `systems`, `web`, `fun`.

**Featured** (in order):
1. ARC — `ARC-REMOTE-DA`
2. Permission-Aware Multi-Tenant RAG — `Permission-Aware-Multi-Tenant-RAG`
3. MediThread — `YODHA-HACK`
4. Search Engine — `Search_Engine`
5. Mitzegle — `Mitzegle`
6. Docker Reverse Proxy — `Traefik-Remake`
7. kling-label-detector — `kling-label-detector`
8. Moro — `Moro`

**Archive** (filterable: All / AI & ML / Backend & Systems / Web / Hardware & Fun):

- **ai:** Gen-Ai-Nyaya-Ai, Mini_Project- (GreenCorridor), Object-detection, NetworkTrafficAnomalyDetection, InboxHire, Clap_on_Jarvis
- **systems:** Tracepoint, Redis_From_Scratch, Auth-engine, HTTP-server-Java, 3DRenderEngine
- **web:** Travel-Mov, A-drive, Zorvyn-Assessment (live), revamped-apple-vision, ReactSampleProject (k72 clone), Glide, Personal_Expense_Tracker
- **fun:** Gesture Home Switch (no repo, opens the modal), Valentine-day-Special (live), PhotoGallery-HackKP, Lost-and-Found-Project

**Excluded:** private repos (ARCONWRIST, Plumeria-Holidays, SaaS-Ai-Agent, Pluto, SAUVC, Mern_Stack, Chat-app-pn-way), Tony_Stark2.0, tiny or test repos.

**Stats panel:** the repo count becomes a literal `50+` (54 public non-fork repos on 2026-11-06). The other three stats keep their current values.

## 5. Performance

- Delete `public/hero.mp4` (7.9 MB) and the `/hero.webm` reference.
- Fonts load once, from `index.html` only. Drop the `@import` in `theme.css` and drop Inter.
  - Weights: Archivo 400/600/700, Space Grotesk 400/500, JetBrains Mono 400.
  - Inter usages fall back to `--font-mono`.
- Renderer:
  - `antialias: false`, `powerPreference: 'high-performance'`
  - DPR `min(devicePixelRatio, 1.5)` on desktop, 1 on mobile
- `quality.js` samples frame times. If the mean exceeds 22 ms over 120 frames → tier `low`: half the draw range for nodes and edges, DPR 1, halo pass off. It never steps back up within a session.
- Consolidate Home.jsx's scroll effects. Remove the dark→light body tween. Merge per-element `from` tweens into `ScrollTrigger.batch` where they share a trigger.
- ScrollSmoother: `smoothTouch: false`.
- `prefers-reduced-motion: reduce`:
  - ScrollSmoother runs with `smooth: 0` and `effects: false` (the wrapper CSS assumes ScrollSmoother is present)
  - no decode effects, no cursor ring
  - the canvas renders one static frame per formation change and does not animate

## 6. Testing and verification

- `vitest` (dev dependency), `npm test` → `vitest run`:
  - `formations.test.js`: each generator returns `count * 3` finite floats, is deterministic for a given seed, and the projects formation assigns exactly 8 clusters.
  - `graph.test.js`: there are `count * k` or fewer edges, with no self-links and no duplicate pairs.
  - `quality.test.js`: stays `high` under the threshold, drops to `low` above it, and never climbs back.
  - `projects.test.js`: unique ids, valid categories, exactly 8 featured entries, and every featured `href` matches `https://github.com/Aariyan007/`.
- **Gates:** `npm run build`, `npm run lint`, `npm test`.
- **Browser pass** (built-in browser, dev server):
  - screenshots of hero, about, experience, projects and contact at desktop and 375×812
  - console errors = 0
  - an in-page rAF sampler records mean fps during a scripted scroll
- **Bundle report:** initial JS gzip vs the 128.7 KB baseline, and the size of the `three` chunk.

## 7. Risks

- **GPU cost on low-end phones.** Mitigated by the node cap, the adaptive tier and reduced motion.
- **ScrollSmoother + fixed canvas.** The canvas lives outside `#smooth-wrapper`, so smoothing transforms never touch it.
- **iCloud eviction of `node_modules`** (found while launching). This is an environment issue, not part of this spec. The fix: `node_modules.nosync` plus a symlink, or moving the project off Desktop.
