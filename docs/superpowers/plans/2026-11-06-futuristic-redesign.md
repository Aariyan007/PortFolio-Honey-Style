# Futuristic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the portfolio into a futuristic, faster site: a persistent full-page Three.js neural graph that re-forms per section, HUD/decode effects, real GitHub projects (8 featured + filterable archive), and a lighter first load.

**Architecture:** A plain three.js class (`NeuralScene`) renders one fixed canvas behind all content; pure, unit-tested modules generate formations, edges, scroll mapping and quality decisions. A React wrapper (`NeuralCanvas`) lazy-loads the scene and wires scroll, pointer and highlight events to its small API. UI effects are React components plus GSAP; project data lives in one data module.

**Tech Stack:** React 19, Vite 8, GSAP 3.15 (ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin, TextPlugin), three 0.187.0, vitest 5.1.0, Tailwind 4 (unchanged).

**Spec:** `docs/superpowers/specs/2026-11-06-futuristic-redesign-design.md`

## Global Constraints

- Node must be ≥ 22.12 (Vite 8 requirement). The system Node is 22.9.0 and **hangs Vite**; prefix every shell session with `export PATH=/Users/lynux/.nvm/versions/node/v22.16.0/bin:$PATH`.
- All app commands run from `FrontEnd/`.
- New dependencies: `three@0.187.0` (runtime), `vitest@5.1.0` (dev). Nothing else — no React Three Fiber, no postprocessing.
- Palette tokens: `--color-accent: #f59e0b`, `--color-accent-secondary: #ff8c42`, `--color-hot: #ff3b30`, background `#0a0a0a`.
- Fonts: Archivo, Space Grotesk, JetBrains Mono only, loaded once from `index.html`.
- Desktop node count 1400, mobile 500; DPR `min(devicePixelRatio, 1.5)` desktop, `1` mobile.
- No `backdrop-filter` on any element above the canvas except the navbar pill (blur re-renders every frame over an animating canvas).
- Every animation respects `prefers-reduced-motion: reduce`.
- Project data is static; no runtime GitHub API calls.
- About and Experience copy does not change.
- Work on branch `feat/futuristic-redesign`. **Commit steps run only after the user has OK'd commits**; otherwise stage nothing and continue.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **WebGL unavailable** (GPU blocked, old phone): page shows the amber gradient fallback, the loader still finishes, console has one warning and no errors. Pinned by Task 3 Step 9 (`?nowebgl`).
2. **Scene chunk slow or never ready:** the loader must not hang; it exits at most 5 s after mount. Pinned by Task 6 `gate.test.js`.
3. **Tab hidden then shown** (one huge frame gap): must not drop the graph to low quality. Pinned by Task 2 `quality.test.js` "ignores spikes".
4. **A section id missing or renamed:** the graph must not jump to the wrong formation. Pinned by Task 2 `scrollMap.test.js` "missing section".
5. **iOS rubber-band overscroll / scrolling past the end:** formation clamps to the first / last state. Pinned by Task 2 `scrollMap.test.js` "negative scroll" and "past the end".

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `FrontEnd/.nvmrc` | create | pins Node 22.16.0 |
| `FrontEnd/package.json` | modify | deps, `test` script, engines |
| `FrontEnd/src/data/projects.js` | create | FEATURED, ARCHIVE, CATEGORIES, STATS |
| `FrontEnd/src/data/sections.js` | create | section ids + labels shared by HUD, navbar, canvas |
| `FrontEnd/src/three/prng.js` | create | seeded PRNG + gaussian |
| `FrontEnd/src/three/formations.js` | create | 5 formation generators |
| `FrontEnd/src/three/graph.js` | create | kNN edges + edge lengths |
| `FrontEnd/src/three/quality.js` | create | frame-time → quality tier |
| `FrontEnd/src/three/scrollMap.js` | create | scroll position → formation pair + mix |
| `FrontEnd/src/three/events.js` | create | cluster highlight event |
| `FrontEnd/src/three/shaders/*.glsl` | create | common, node, edge shaders |
| `FrontEnd/src/three/NeuralScene.js` | create | WebGL renderer + public API |
| `FrontEnd/src/components/NeuralCanvas.jsx/.css` | create | lazy load + wiring + fallback |
| `FrontEnd/src/hooks/useActiveSection.js` | create | IntersectionObserver active section |
| `FrontEnd/src/components/Hud.jsx/.css` | create | HUD overlay + scanlines |
| `FrontEnd/src/components/DecodeText.jsx` | create | scramble-decode text |
| `FrontEnd/src/lib/gate.js` | create | loader exit gate with timeout |
| `FrontEnd/src/components/ProjectArchive.jsx/.css` | create | filter chips + archive rows |
| `FrontEnd/src/pages/Home.jsx/.css` | modify | mount canvas/HUD, remove video, consolidate triggers |
| `FrontEnd/src/components/{Loader,CustomCursor,Navbar,Projects,Experience,Contact}.*` | modify | effects per spec §3 |
| `FrontEnd/src/styles/theme.css`, `FrontEnd/index.html` | modify | tokens, fonts |
| `FrontEnd/public/hero.mp4` | delete | 7.9 MB video |

---

### Task 1: Tooling + project data module

**Files:**
- Create: `FrontEnd/.nvmrc`, `FrontEnd/src/data/projects.js`, `FrontEnd/src/data/projects.test.js`, `FrontEnd/src/data/sections.js`
- Modify: `FrontEnd/package.json`, `FrontEnd/src/components/Experience.jsx:4`

**Interfaces:**
- Produces: `FEATURED: Featured[]` (8), `ARCHIVE: ArchiveItem[]`, `CATEGORIES: {id,label}[]` (first is `all`), `STATS: {value,label,tag}[]`, `CATEGORY_LABEL: Record<string,string>`.
  - `Featured = { id, title, subtitle, year, status, description, longDescription, tags: string[], metrics: string[], href, live?, accent, category }`
  - `ArchiveItem = { id, title, description, year, lang, stars, href: string|null, live?, category, subtitle?, longDescription?, tags? }`
- Produces: `SECTIONS: {id,label,nav?}[]`, `SECTION_IDS: string[]` from `src/data/sections.js`.

- [ ] **Step 1: Pin Node and install deps**

```bash
export PATH=/Users/lynux/.nvm/versions/node/v22.16.0/bin:$PATH
cd FrontEnd
echo "22.16.0" > .nvmrc
npm install three@0.187.0
npm install -D vitest@5.1.0
```

- [ ] **Step 2: Add test script and engines to `package.json`**

In `"scripts"` add `"test": "vitest run"`. Add a top-level `"engines": { "node": "^20.19.0 || >=22.12.0" }`.

- [ ] **Step 3: Write the failing data test** — `FrontEnd/src/data/projects.test.js`

```js
import { describe, it, expect } from "vitest";
import { FEATURED, ARCHIVE, CATEGORIES, STATS, CATEGORY_LABEL } from "./projects.js";

const CATEGORY_IDS = CATEGORIES.map((c) => c.id).filter((id) => id !== "all");
const GH = "https://github.com/Aariyan007/";

describe("projects data", () => {
  it("has exactly 8 featured projects", () => {
    expect(FEATURED).toHaveLength(8);
  });

  it("uses unique ids across featured and archive", () => {
    const ids = [...FEATURED, ...ARCHIVE].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every entry a valid category with a label", () => {
    for (const p of [...FEATURED, ...ARCHIVE]) {
      expect(CATEGORY_IDS, p.id).toContain(p.category);
      expect(CATEGORY_LABEL[p.category], p.id).toBeTruthy();
    }
  });

  it("links every featured project to a real repo", () => {
    for (const p of FEATURED) {
      expect(p.href.startsWith(GH), p.id).toBe(true);
      expect(p.href, p.id).not.toMatch(/REPO-NAME/);
    }
  });

  it("links archive entries to a repo, or gives them modal content", () => {
    for (const p of ARCHIVE) {
      if (p.href === null) expect(p.longDescription, p.id).toBeTruthy();
      else expect(p.href.startsWith(GH), p.id).toBe(true);
      if (p.live) expect(p.live.startsWith("https://"), p.id).toBe(true);
    }
  });

  it("has every field the cards and rows render", () => {
    for (const p of FEATURED) {
      for (const key of ["title", "subtitle", "year", "status", "description", "longDescription", "accent"]) {
        expect(p[key], `${p.id}.${key}`).toBeTruthy();
      }
      expect(p.tags.length, p.id).toBeGreaterThan(0);
      expect(p.metrics.length, p.id).toBeGreaterThan(0);
    }
    for (const p of ARCHIVE) {
      for (const key of ["title", "description", "year", "lang"]) {
        expect(p[key], `${p.id}.${key}`).toBeTruthy();
      }
      expect(Number.isInteger(p.stars), p.id).toBe(true);
    }
  });

  it("keeps every archive category non-empty", () => {
    for (const id of CATEGORY_IDS) {
      expect(ARCHIVE.some((p) => p.category === id), id).toBe(true);
    }
  });

  it("exposes 4 stats", () => {
    expect(STATS).toHaveLength(4);
  });
});
```

- [ ] **Step 4: Run it — expect failure**

Run: `npx vitest run src/data/projects.test.js`
Expected: FAIL — `Failed to resolve import "./projects.js"`.

- [ ] **Step 5: Write `FrontEnd/src/data/projects.js`**

```js
export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & ML" },
  { id: "systems", label: "Backend & Systems" },
  { id: "web", label: "Web" },
  { id: "fun", label: "Hardware & Fun" },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const GH = "https://github.com/Aariyan007";

export const FEATURED = [
  {
    id: "arc",
    title: "ARC",
    subtitle: "Remote AI Operating System Manager",
    year: "2026",
    status: "Ongoing",
    category: "ai",
    description:
      "A headless agentic daemon that runs autonomous OS tasks for any remote controller (web, CLI or mobile) over a single WebSocket streaming protocol, with local semantic routing and a fail-closed action verifier.",
    longDescription:
      "ARC is a headless agentic daemon built with FastAPI and Python that executes OS tasks on behalf of any remote client through one unified WebSocket protocol. A thread-safe persistent job store streams granular execution events (ack, clarify, execute, verify, result), so multi-turn tasks resolve asynchronously without network timeouts. Intent classification runs locally on SBERT (MiniLM) embeddings, routing 60+ OS actions in under 15ms and cutting cloud LLM API overhead by 76%. A fail-closed verifier snapshots the OS before and after every action to block destructive agent hallucinations, and a clarification system pauses active tasks when the agent needs more input. An autonomous Computer Use pipeline built on macOS Accessibility (AX) utilities and screen OCR is in progress, with graceful degradation and permission-aware error handling.",
    tags: ["FastAPI", "Python", "WebSockets", "SBERT", "macOS AX API"],
    metrics: ["<15 ms intent routing", "−76% LLM calls", "60+ OS actions"],
    href: `${GH}/ARC-REMOTE-DA`,
    accent: "#a78bfa",
  },
  {
    id: "mt-rag",
    title: "Multi-Tenant RAG",
    subtitle: "Permission-aware retrieval enforced by Postgres RLS",
    year: "2026",
    status: "Completed",
    category: "ai",
    description:
      "A RAG backend where many organizations share one deployment and Postgres row-level security decides who can see what. Role and ACL filters run inside the vector query, so nothing leaks into the prompt.",
    longDescription:
      "FastAPI and asyncpg over Postgres 17 with pgvector (HNSW) and row-level security. Users carry roles (admin, member, viewer) and document ACL groups; the permission filter runs inside the similarity search before any chunk reaches the LLM, and an audit log records what was retrieved for whom. Answers come from Claude via the Anthropic SDK, with an extractive fallback when no key is set. Embeddings use Voyage or a deterministic offline hasher. Observability through OpenTelemetry, Jaeger, Prometheus and Grafana; shipped with Docker Compose and GitHub Actions.",
    tags: ["FastAPI", "Postgres RLS", "pgvector", "Claude", "OpenTelemetry"],
    metrics: ["DB-enforced tenancy", "Audit log", "HNSW search"],
    href: `${GH}/Permission-Aware-Multi-Tenant-RAG`,
    accent: "#38bdf8",
  },
  {
    id: "medithread",
    title: "MediThread",
    subtitle: "One health record per family — YODHA hackathon",
    year: "2026",
    status: "Hackathon build",
    category: "ai",
    description:
      "Upload a prescription or lab photo and MediThread reads it, explains it in plain English and Malayalam, and checks it against the family record for danger signs. The AI proposes; code decides.",
    longDescription:
      "Built by team FullSleeve (S. Aariyan, Jithin P R, Mathew Maijo). A guard-railed agent with 46 registered tools and 4 permission levels, where every write needs the person's yes and replies are checked by code and a second model. Drug-interaction checks (about 160k DDInter pairs), trends and reminders are plain Python, so they keep working when every AI service is down. FastAPI, SQLAlchemy, Supabase Postgres and Redis behind a React 19 + GSAP frontend, load balanced with nginx; killing an API copy mid load test produced 0 errors.",
    tags: ["FastAPI", "React 19", "Redis", "Gemini", "Groq"],
    metrics: ["46 agent tools", "365 tests", "0 errors under chaos"],
    href: `${GH}/YODHA-HACK`,
    accent: "#34d399",
  },
  {
    id: "search-engine",
    title: "Search Engine",
    subtitle: "Crawler → inverted index → BM25 + PageRank",
    year: "2026",
    status: "Completed",
    category: "systems",
    description:
      "A search engine built from scratch in Node.js: web crawler, text pipeline, inverted index, and results ranked by BM25 relevance fused with PageRank authority.",
    longDescription:
      "Crawls seed domains with axios and cheerio, extracts visible text, tokenizes and strips stopwords, then builds an inverted index. Queries are scored with BM25 (k1 = 1.5, b = 0.75) and blended with PageRank scores (damping 0.85, 10 iterations) at a 70/30 weight for the final ranking. Every stage writes plain JSON, so each phase can be run and inspected on its own.",
    tags: ["Node.js", "axios", "cheerio", "BM25", "PageRank"],
    metrics: ["BM25 k1 = 1.5", "PageRank d = 0.85", "70/30 fusion"],
    href: `${GH}/Search_Engine`,
    accent: "#f59e0b",
  },
  {
    id: "mitzegle",
    title: "Mitzegle",
    subtitle: "Anonymous random video chat for MITS students",
    year: "2026",
    status: "Completed",
    category: "web",
    description:
      "Log in with a college email, get paired with another verified student, skip or leave any time. The other person never sees your email, branch or roll number.",
    longDescription:
      "Email OTP login restricted to the college domain (6-digit code, 5-minute expiry, 5 tries) issues a 7-day session token. A socket.io matchmaking server pairs waiting students and opens a Zego video call; skip re-queues you and a partner leaving drops you back to waiting. Next.js 16, React 19 and Tailwind 4 on the front; Express 5, socket.io, MongoDB and JWT behind it.",
    tags: ["Next.js 16", "socket.io", "Express 5", "MongoDB", "WebRTC"],
    metrics: ["OTP-verified", "Real-time matching"],
    href: `${GH}/Mitzegle`,
    accent: "#fb7185",
  },
  {
    id: "reverse-proxy",
    title: "Docker Reverse Proxy",
    subtitle: "Auto-discovering round-robin load balancer",
    year: "2026",
    status: "Completed",
    category: "systems",
    description:
      "A Node.js reverse proxy that watches the Docker daemon, auto-registers containers as they start, and round-robins traffic across replicas with subdomain routing.",
    longDescription:
      "Listens to Docker events through dockerode, registers each container's IP from the proxy network under its service label, and removes it when the container dies. Requests to <service>.localhost are matched by subdomain and routed round-robin with http-proxy, WebSockets included. A small management API (POST /containers, GET /services) spins up replicated services. The registry is in-memory and there are no health checks yet.",
    tags: ["Node.js", "Docker", "dockerode", "http-proxy", "Express"],
    metrics: ["Docker events", "Round-robin", "WebSocket proxy"],
    href: `${GH}/Traefik-Remake`,
    accent: "#60a5fa",
  },
  {
    id: "kling-label",
    title: "Kling Label Detector",
    subtitle: "Reverse-engineering Kling AI's hidden AI-content labels",
    year: "2026",
    status: "Research published",
    category: "ai",
    description:
      "Found where Kling AI hides its China GB 45438-2025 'AI-generated' label in images and videos, and shipped kling-label, a dependency-free detection tool.",
    longDescription:
      "The label lives in a PNG tEXt chunk or MP4 metadata key named AIGC holding the GB 45438-2025 fields as JSON; kling-label read it in 36 of 36 Kling PNGs. The request ID dates a file to about one second, and an H.264 'kling-ai' marker sits inside newer video streams. Pixel-watermark tests with planted positive controls found no shared invisible pattern. Detection only, for research and education.",
    tags: ["Python", "Reverse engineering", "PNG / MP4 metadata", "Forensics"],
    metrics: ["36/36 PNGs detected", "Zero dependencies"],
    href: `${GH}/kling-label-detector`,
    accent: "#facc15",
  },
  {
    id: "moro",
    title: "Moro",
    subtitle: "A compiler targeting Java, C and JVM bytecode",
    year: "2025",
    status: "Completed",
    category: "systems",
    description:
      "A tiny programming language with a full compiler pipeline that emits Java source, C source, and raw JVM bytecode.",
    longDescription:
      "Moro has a hand-written lexer, a recursive AST parser, and a semantic analyzer that checks variables are declared before use. Code generation targets Java and C source, and a separate bytecode generator writes .class files directly, with its own constant pool, class builder and method builder, so programs run on the JVM without javac.",
    tags: ["Java", "Compilers", "JVM Bytecode", "C"],
    metrics: ["Lexer → AST → bytecode", "3 targets"],
    href: `${GH}/Moro`,
    accent: "#c084fc",
  },
];

export const ARCHIVE = [
  // ── AI & ML ──
  { id: "nyaya-ai", title: "NyayaAI", category: "ai", year: "2025", lang: "Python", stars: 0, href: `${GH}/Gen-Ai-Nyaya-Ai`,
    description: "Legal PDF assistant: plain-English explanations and risk flags grounded in Indian legal acts (RAG + Gemini)." },
  { id: "greencorridor", title: "GreenCorridor", category: "ai", year: "2025", lang: "JavaScript", stars: 1, href: `${GH}/Mini_Project-`,
    description: "Federated learning from scratch to clear ambulance routes; SGD in pure JS, raw GPS never leaves the edge." },
  { id: "object-detection", title: "Waste Object Detection", category: "ai", year: "2024", lang: "Python", stars: 0, href: `${GH}/Object-detection`,
    description: "Real-time plastic and waste detection with OpenCV and MobileNet SSD." },
  { id: "network-anomaly", title: "Network Anomaly Detection", category: "ai", year: "2024", lang: "Jupyter", stars: 2, href: `${GH}/NetworkTrafficAnomalyDetection`,
    description: "Isolation Forest plus dimensionality reduction to flag anomalous network traffic." },
  { id: "inboxhire", title: "InboxHire", category: "ai", year: "2025", lang: "JavaScript", stars: 0, href: `${GH}/InboxHire`,
    description: "Scrapes internship listings, refines them with Gemini, and emails a PDF digest every few hours." },
  { id: "clap-on-jarvis", title: "Clap on Jarvis", category: "ai", year: "2026", lang: "Python", stars: 1, href: `${GH}/Clap_on_Jarvis`,
    description: "Double-clap voice activation that launches a dev environment hands-free." },
  // ── Backend & Systems ──
  { id: "tracepoint", title: "Tracepoint", category: "systems", year: "2026", lang: "JavaScript", stars: 1, href: `${GH}/Tracepoint`,
    description: "Structured JSON logger with pluggable transports and an ingestion server with token-bucket rate limiting." },
  { id: "redis-from-scratch", title: "Redis From Scratch", category: "systems", year: "2026", lang: "JavaScript", stars: 0, href: `${GH}/Redis_From_Scratch`,
    description: "Redis-inspired in-memory key-value store: networking, caching and persistence from the ground up." },
  { id: "auth-engine", title: "Auth Engine", category: "systems", year: "2026", lang: "JavaScript", stars: 0, href: `${GH}/Auth-engine`,
    description: "Teaching repo for rate limiting with Redis." },
  { id: "http-server-java", title: "HTTP Server (Java)", category: "systems", year: "2026", lang: "Java", stars: 0, href: `${GH}/HTTP-server-Java`,
    description: "An HTTP server built from raw sockets, for learning." },
  { id: "torus-renderer", title: "3D Torus Renderer", category: "systems", year: "2025", lang: "Java", stars: 0, href: `${GH}/3DRenderEngine`,
    description: "Software rasterizer in Java Swing: matrices, z-buffer and barycentric fill, no graphics library." },
  // ── Web ──
  { id: "trav-mov", title: "Trav-Mov", category: "web", year: "2025", lang: "JavaScript", stars: 0, href: `${GH}/Travel-Mov`,
    description: "Movies turned into travel itineraries with Gemini (MERN). Designed by Mathew MK." },
  { id: "a-drive", title: "A-drive", category: "web", year: "2025", lang: "EJS", stars: 2, href: `${GH}/A-drive`,
    description: "Minimal Google Drive clone: auth, upload and download on Express, MongoDB and Firebase Storage." },
  { id: "zorvyn", title: "Zorvyn Finance Dashboard", category: "web", year: "2026", lang: "JavaScript", stars: 0, href: `${GH}/Zorvyn-Assessment`,
    live: "https://zorvyn-assessment-gamma.vercel.app",
    description: "Finance dashboard UI with role-based views, filters and spending insights." },
  { id: "apple-vision", title: "Apple Vision Pro Revamp", category: "web", year: "2024", lang: "JavaScript", stars: 3, href: `${GH}/revamped-apple-vision`,
    description: "A redesigned Apple Vision Pro product site." },
  { id: "k72-clone", title: "K72 Clone", category: "web", year: "2025", lang: "JavaScript", stars: 0, href: `${GH}/ReactSampleProject`,
    description: "High-fidelity k72.ca clone in React and GSAP with scroll-driven animation." },
  { id: "glide", title: "Glide", category: "web", year: "2025", lang: "JavaScript", stars: 0, href: `${GH}/Glide`,
    description: "An enhanced Uber clone." },
  { id: "expense-tracker", title: "Personal Expense Tracker", category: "web", year: "2025", lang: "JavaScript", stars: 5, href: `${GH}/Personal_Expense_Tracker`,
    description: "Track spending by category." },
  // ── Hardware & Fun ──
  { id: "gesture-home-switch", title: "Gesture Home Switch", category: "fun", year: "2026", lang: "ESP32", stars: 0, href: null,
    subtitle: "Gesture-controlled wireless home appliance switch",
    description: "Wrist-worn gesture sensor switching appliances over ESP-NOW, with a cloud dashboard.",
    longDescription:
      "This IoT project uses an MPU6050 accelerometer/gyroscope on a wrist-worn ESP32 to recognize hand gestures in real-time. The recognized gesture is transmitted via ESP-NOW (a low-latency peer-to-peer protocol) to a receiver ESP32 connected to relay modules controlling home appliances. A companion web dashboard built with React provides remote monitoring and manual override.",
    tags: ["ESP32", "MPU6050", "ESP-NOW", "IoT"] },
  { id: "valentine", title: "Valentine's Day Special", category: "fun", year: "2026", lang: "JavaScript", stars: 0, href: `${GH}/Valentine-day-Special`,
    live: "https://valentineday-henna.vercel.app",
    description: "The 'No' button runs away; the 'Yes' button keeps growing." },
  { id: "photo-gallery", title: "PhotoGallery", category: "fun", year: "2025", lang: "JavaScript", stars: 0, href: `${GH}/PhotoGallery-HackKP`,
    description: "Upload and browse images with smooth animations (HackKP)." },
  { id: "lost-and-found", title: "Lost and Found", category: "fun", year: "2026", lang: "Laravel", stars: 0, href: `${GH}/Lost-and-Found-Project`,
    description: "Laravel lost-and-found board built for a web programming course." },
];

export const STATS = [
  { value: "50+", label: "Public repos on GitHub", tag: null },
  { value: "12+", label: "Open Source PRs", tag: null },
  { value: "✓", label: "Hacktoberfest 2025", tag: "COMPLETED" },
  { value: "3+", label: "Years Coding", tag: null },
];
```

- [ ] **Step 6: Write `FrontEnd/src/data/sections.js`**

```js
// Order matters: index i is formation i in the neural graph.
export const SECTIONS = [
  { id: "hero", label: "INTRO" },
  { id: "about", label: "ABOUT", nav: true },
  { id: "experience", label: "EXPERIENCE", nav: true },
  { id: "projects-section", label: "WORK", nav: true },
  { id: "contact-section", label: "CONTACT" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
```

- [ ] **Step 7: Run the test — expect pass**

Run: `npx vitest run src/data/projects.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 8: Fix the baseline lint error**

In `FrontEnd/src/components/Experience.jsx` line 4 remove `ExternalLink` from the lucide import:

```js
import { Briefcase, Calendar, MapPin, Code2, Sparkles } from "lucide-react";
```

Run: `npx eslint .`
Expected: 0 errors, 1 warning (Loader `onFinish` deps — fixed in Task 6).

- [ ] **Step 9: Commit** (only with user OK)

```bash
git add FrontEnd/.nvmrc FrontEnd/package.json FrontEnd/package-lock.json FrontEnd/src/data FrontEnd/src/components/Experience.jsx
git commit -m "feat(data): add project data module, vitest and three"
```

---

### Task 2: Pure graph helpers (formations, edges, quality, scroll map)

**Files:**
- Create: `FrontEnd/src/three/prng.js`, `formations.js`, `graph.js`, `quality.js`, `scrollMap.js`, `events.js`
- Test: `FrontEnd/src/three/formations.test.js`, `graph.test.js`, `quality.test.js`, `scrollMap.test.js`

**Interfaces:**
- Produces:
  - `mulberry32(seed: number) => () => number` in [0,1); `gaussian(rand) => number`
  - `FORMATION_NAMES: string[]` (5), `PROJECT_CLUSTERS = 8`
  - `buildFormations(count: int, seed = 7) => { positions: Float32Array[5], clusters: Float32Array, seeds: Float32Array }` — `positions[f].length === count*3`; `clusters[i] ∈ {-1, 0..7}`; throws `RangeError` on non-positive / non-integer count
  - `buildEdges(positions: Float32Array, count: int, k = 3) => Uint32Array` pairs `[a0,b0,a1,b1,…]`, `a < b`
  - `edgeLengths(positionsList: Float32Array[], edges: Uint32Array) => Float32Array[]`
  - `createQualityMonitor({ thresholdMs = 22, windowSize = 120, maxSampleMs = 250 }) => { sample(dtMs) => "high"|"low", tier }`
  - `resolveFormation(scrollY, viewportH, tops: number[]) => { from, to, mix }`
  - `HIGHLIGHT_EVENT = "neural:highlight"`, `emitHighlight(cluster: number|null)`

- [ ] **Step 1: Write failing tests**

`FrontEnd/src/three/formations.test.js`:

```js
import { describe, it, expect } from "vitest";
import { buildFormations, FORMATION_NAMES, PROJECT_CLUSTERS } from "./formations.js";
import { mulberry32 } from "./prng.js";

describe("mulberry32", () => {
  it("returns values in [0, 1) deterministically", () => {
    const a = mulberry32(5), b = mulberry32(5);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(v).toBe(b());
    }
  });
});

describe("buildFormations", () => {
  it("returns one count*3 array of finite floats per formation", () => {
    const { positions } = buildFormations(500, 1);
    expect(positions).toHaveLength(FORMATION_NAMES.length);
    for (const p of positions) {
      expect(p).toHaveLength(1500);
      expect(p.every(Number.isFinite)).toBe(true);
    }
  });

  it("is deterministic for a seed and differs across seeds", () => {
    const a = buildFormations(200, 42);
    const b = buildFormations(200, 42);
    const c = buildFormations(200, 43);
    expect(Array.from(a.positions[0])).toEqual(Array.from(b.positions[0]));
    expect(Array.from(a.positions[0])).not.toEqual(Array.from(c.positions[0]));
  });

  it("uses all 8 project clusters and marks dust as -1", () => {
    const { clusters } = buildFormations(1400, 7);
    const values = Array.from(clusters);
    expect(new Set(values.filter((c) => c >= 0)).size).toBe(PROJECT_CLUSTERS);
    expect(values.every((c) => c === -1 || (Number.isInteger(c) && c < PROJECT_CLUSTERS))).toBe(true);
  });

  it("also covers all clusters at the mobile count", () => {
    const { clusters } = buildFormations(500, 7);
    expect(new Set(Array.from(clusters).filter((c) => c >= 0)).size).toBe(PROJECT_CLUSTERS);
  });

  it("gives every node a seed in [0, 1)", () => {
    const { seeds } = buildFormations(300, 3);
    expect(Array.from(seeds).every((s) => s >= 0 && s < 1)).toBe(true);
  });

  it("handles a single node", () => {
    const { positions } = buildFormations(1, 7);
    for (const p of positions) expect(p.every(Number.isFinite)).toBe(true);
  });

  it("rejects bad counts", () => {
    expect(() => buildFormations(0)).toThrow(RangeError);
    expect(() => buildFormations(-5)).toThrow(RangeError);
    expect(() => buildFormations(10.5)).toThrow(RangeError);
  });
});
```

`FrontEnd/src/three/graph.test.js`:

```js
import { describe, it, expect } from "vitest";
import { buildEdges, edgeLengths } from "./graph.js";
import { buildFormations } from "./formations.js";

describe("buildEdges", () => {
  it("links nearest neighbours and dedupes (exact small case)", () => {
    // x = 0, 1, 2, 10 on a line, k = 1
    const p = new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0, 10, 0, 0]);
    expect(Array.from(buildEdges(p, 4, 1))).toEqual([0, 1, 1, 2, 2, 3]);
  });

  it("has no self links, no duplicates, valid indices, at most count*k edges", () => {
    const count = 400;
    const { positions } = buildFormations(count, 9);
    const edges = buildEdges(positions[0], count, 3);
    expect(edges.length % 2).toBe(0);
    expect(edges.length / 2).toBeLessThanOrEqual(count * 3);
    const keys = new Set();
    for (let e = 0; e < edges.length; e += 2) {
      const a = edges[e], b = edges[e + 1];
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(count);
      keys.add(`${a}-${b}`);
    }
    expect(keys.size).toBe(edges.length / 2);
  });

  it("rejects a positions array of the wrong length", () => {
    expect(() => buildEdges(new Float32Array(5), 2, 1)).toThrow(RangeError);
  });
});

describe("edgeLengths", () => {
  it("measures each edge in each formation", () => {
    const f0 = new Float32Array([0, 0, 0, 3, 4, 0]);
    const f1 = new Float32Array([0, 0, 0, 0, 0, 2]);
    const [l0, l1] = edgeLengths([f0, f1], new Uint32Array([0, 1]));
    expect(l0[0]).toBeCloseTo(5);
    expect(l1[0]).toBeCloseTo(2);
  });
});
```

`FrontEnd/src/three/quality.test.js`:

```js
import { describe, it, expect } from "vitest";
import { createQualityMonitor } from "./quality.js";

const feed = (m, ms, n) => { for (let i = 0; i < n; i++) m.sample(ms); };

describe("createQualityMonitor", () => {
  it("stays high when frames are fast", () => {
    const m = createQualityMonitor();
    feed(m, 16, 500);
    expect(m.tier).toBe("high");
  });

  it("drops to low once the window average exceeds the threshold", () => {
    const m = createQualityMonitor({ windowSize: 120 });
    feed(m, 30, 119);
    expect(m.tier).toBe("high"); // window not full yet
    m.sample(30);
    expect(m.tier).toBe("low");
  });

  it("never climbs back to high", () => {
    const m = createQualityMonitor({ windowSize: 10 });
    feed(m, 40, 10);
    feed(m, 5, 1000);
    expect(m.tier).toBe("low");
  });

  it("ignores spikes from a hidden tab and junk samples", () => {
    const m = createQualityMonitor({ windowSize: 10 });
    feed(m, 16, 9);
    m.sample(5000); // tab came back after 5 s
    m.sample(Number.NaN);
    m.sample(-3);
    m.sample(16);
    expect(m.tier).toBe("high");
  });
});
```

`FrontEnd/src/three/scrollMap.test.js`:

```js
import { describe, it, expect } from "vitest";
import { resolveFormation } from "./scrollMap.js";

// five sections, each 1000px tall, viewport 800px
const tops = [0, 1000, 2000, 3000, 4000];
const vh = 800;

describe("resolveFormation", () => {
  it("starts in the hero formation", () => {
    expect(resolveFormation(0, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("mixes while the next section's top travels from viewport bottom to 30%", () => {
    // transition 0→1 spans scrollY 200 (1000-800) .. 760 (1000-240)
    expect(resolveFormation(200, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
    expect(resolveFormation(480, vh, tops).mix).toBeCloseTo(0.5);
    expect(resolveFormation(760, vh, tops)).toEqual({ from: 0, to: 1, mix: 1 });
  });

  it("holds the finished formation, then starts the next transition", () => {
    expect(resolveFormation(1100, vh, tops)).toEqual({ from: 0, to: 1, mix: 1 });
    // transition 1→2 spans 1200..1760, so 1300 is 100/560 of the way in
    const f = resolveFormation(1300, vh, tops);
    expect(f.from).toBe(1);
    expect(f.to).toBe(2);
    expect(f.mix).toBeCloseTo(100 / 560);
  });

  it("clamps past the end", () => {
    expect(resolveFormation(99999, vh, tops)).toEqual({ from: 3, to: 4, mix: 1 });
  });

  it("clamps negative scroll (iOS rubber-band)", () => {
    expect(resolveFormation(-120, vh, tops)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("skips a missing section (Infinity top) instead of shifting formations", () => {
    const missingAbout = [0, Infinity, 2000, 3000, 4000];
    // past experience's transition start: maps to 1→2, not 0→1
    expect(resolveFormation(1500, vh, missingAbout).from).toBe(1);
    expect(resolveFormation(100, vh, missingAbout)).toEqual({ from: 0, to: 1, mix: 0 });
  });

  it("handles fewer than two sections", () => {
    expect(resolveFormation(500, vh, [0])).toEqual({ from: 0, to: 0, mix: 0 });
    expect(resolveFormation(500, vh, [])).toEqual({ from: 0, to: 0, mix: 0 });
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run src/three`
Expected: FAIL — unresolved imports `./formations.js`, `./graph.js`, `./quality.js`, `./scrollMap.js`.

- [ ] **Step 3: Write `FrontEnd/src/three/prng.js`**

```js
// Small, fast, seedable PRNG so formations are deterministic and testable.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal sample (Box-Muller).
export function gaussian(rand) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}
```

- [ ] **Step 4: Write `FrontEnd/src/three/formations.js`**

```js
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
```

> Note: with 500 nodes, about 375 go to clusters, so round-robin gives every cluster ~47 nodes. With `count = 1` the cluster test is not asserted.

- [ ] **Step 5: Write `FrontEnd/src/three/graph.js`**

```js
// k-nearest-neighbour edges, brute force. 1400 nodes ≈ 2M distance checks ≈ 20 ms, run once.
export function buildEdges(positions, count, k = 3) {
  if (positions.length !== count * 3) {
    throw new RangeError(`positions length ${positions.length} must equal count * 3 (${count * 3})`);
  }
  const seen = new Set();
  const pairs = [];
  for (let i = 0; i < count; i++) {
    const ix = positions[i * 3], iy = positions[i * 3 + 1], iz = positions[i * 3 + 2];
    const nearest = []; // [distSq, j], sorted ascending, length <= k
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix, dy = positions[j * 3 + 1] - iy, dz = positions[j * 3 + 2] - iz;
      const d = dx * dx + dy * dy + dz * dz;
      if (nearest.length < k || d < nearest[nearest.length - 1][0]) {
        nearest.push([d, j]);
        nearest.sort((a, b) => a[0] - b[0]);
        if (nearest.length > k) nearest.pop();
      }
    }
    for (const [, j] of nearest) {
      const a = Math.min(i, j), b = Math.max(i, j);
      const key = a * count + b;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push(a, b);
      }
    }
  }
  return Uint32Array.from(pairs);
}

export function edgeLengths(positionsList, edges) {
  const n = edges.length / 2;
  return positionsList.map((p) => {
    const out = new Float32Array(n);
    for (let e = 0; e < n; e++) {
      const a = edges[e * 2] * 3, b = edges[e * 2 + 1] * 3;
      out[e] = Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1], p[a + 2] - p[b + 2]);
    }
    return out;
  });
}
```

- [ ] **Step 6: Write `FrontEnd/src/three/quality.js`**

```js
// Drops to "low" once the mean frame time over a full window exceeds the threshold.
// One-way by design: flapping between tiers looks worse than staying low.
export function createQualityMonitor({ thresholdMs = 22, windowSize = 120, maxSampleMs = 250 } = {}) {
  let tier = "high";
  const samples = [];
  let sum = 0;
  return {
    sample(dtMs) {
      // NaN, negatives and hidden-tab gaps say nothing about rendering cost
      if (tier === "low" || !(dtMs > 0) || dtMs > maxSampleMs) return tier;
      samples.push(dtMs);
      sum += dtMs;
      if (samples.length > windowSize) sum -= samples.shift();
      if (samples.length === windowSize && sum / windowSize > thresholdMs) tier = "low";
      return tier;
    },
    get tier() {
      return tier;
    },
  };
}
```

- [ ] **Step 7: Write `FrontEnd/src/three/scrollMap.js`**

```js
// Transition i (formation i → i+1) runs while section i+1's top moves
// from the viewport bottom up to 30% of the viewport height.
// A missing section has top = Infinity and is skipped.
export function resolveFormation(scrollY, viewportH, tops) {
  if (tops.length < 2) return { from: 0, to: 0, mix: 0 };
  for (let i = tops.length - 2; i >= 0; i--) {
    const start = tops[i + 1] - viewportH;
    const end = tops[i + 1] - viewportH * 0.3;
    if (Number.isFinite(start) && scrollY >= start) {
      const span = end - start;
      const mix = span > 0 ? Math.min(1, (scrollY - start) / span) : 1;
      return { from: i, to: i + 1, mix };
    }
  }
  return { from: 0, to: 1, mix: 0 };
}
```

- [ ] **Step 8: Write `FrontEnd/src/three/events.js`**

```js
export const HIGHLIGHT_EVENT = "neural:highlight";

// cluster: 0..7 to flare a project cluster, null to clear
export function emitHighlight(cluster) {
  window.dispatchEvent(new CustomEvent(HIGHLIGHT_EVENT, { detail: { cluster } }));
}
```

- [ ] **Step 9: Run — expect pass**

Run: `npx vitest run src/three`
Expected: PASS, 4 files. If the missing-section test fails, confirm `Number.isFinite(start)` is in `resolveFormation`.

- [ ] **Step 10: Commit** (only with user OK)

```bash
git add FrontEnd/src/three
git commit -m "feat(three): pure formation, edge, quality and scroll-map helpers"
```

---

### Task 3: WebGL layer — shaders, NeuralScene, NeuralCanvas, mount behind content

**Files:**
- Create: `FrontEnd/src/three/shaders/common.glsl`, `node.vert.glsl`, `node.frag.glsl`, `edge.vert.glsl`, `edge.frag.glsl`
- Create: `FrontEnd/src/three/NeuralScene.js`, `FrontEnd/src/components/NeuralCanvas.jsx`, `FrontEnd/src/components/NeuralCanvas.css`
- Modify: `FrontEnd/src/pages/Home.jsx`, `FrontEnd/src/pages/Home.css`, `FrontEnd/src/components/Experience.css:5`, `FrontEnd/src/components/Projects.css:7`

**Interfaces:**
- Consumes: everything from Task 2; `SECTION_IDS` from Task 1.
- Produces: `class NeuralScene(canvas, { nodeCount, dpr, animate, seed })` with `setFormation(from, to, mix)`, `setPointer(ndcX, ndcY)`, `highlightCluster(index|null)`, `setQuality("high"|"low")`, `resize()`, `start()`, `pause()`, `resume()`, `dispose()`, `onFrame: (dtMs) => void`.
- Produces: `<NeuralCanvas onReady?: () => void />` — renders `canvas.neural-canvas` or `div.neural-fallback`; calls `onReady` once (after first frame, or immediately on failure).
- Produces: DOM ids `#hero` and `#about` on the existing sections.

- [ ] **Step 1: Write shaders**

`FrontEnd/src/three/shaders/common.glsl` (prepended to both vertex shaders):

```glsl
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
```

`FrontEnd/src/three/shaders/node.vert.glsl`:

```glsl
attribute float aCluster;
uniform float uSize;
uniform float uPixelRatio;
uniform float uHighlight;
uniform float uHighlightAmount;
varying float vAlpha;
varying float vHot;

void main() {
  vec4 mv = viewMatrix * vec4(nodeWorld(aSeed), 1.0);
  gl_Position = projectionMatrix * mv;
  float hl = (uHighlight >= 0.0 && abs(aCluster - uHighlight) < 0.5) ? uHighlightAmount : 0.0;
  gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (1.0 + hl * 1.8) / -mv.z;
  vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + aSeed * 60.0);
  vHot = hl;
}
```

`FrontEnd/src/three/shaders/node.frag.glsl`:

```glsl
uniform vec3 uColor;
uniform vec3 uHotColor;
uniform float uOpacity;
varying float vAlpha;
varying float vHot;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.5, d);
  float glow = pow(core, 3.0);
  vec3 col = mix(uColor, vec3(1.0, 0.95, 0.85), glow);
  col = mix(col, uHotColor, vHot * 0.6);
  gl_FragColor = vec4(col, (core * 0.6 + glow) * vAlpha * uOpacity);
}
```

`FrontEnd/src/three/shaders/edge.vert.glsl`:

```glsl
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
```

`FrontEnd/src/three/shaders/edge.frag.glsl`:

```glsl
uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
varying float vT;
varying float vPhase;
varying float vFade;

void main() {
  float head = fract(uTime * 0.35 + vPhase);
  float pulse = 1.0 - smoothstep(0.0, 0.08, abs(vT - head));
  vec3 col = mix(uColor, vec3(1.0, 0.92, 0.8), pulse);
  gl_FragColor = vec4(col, vFade * (0.18 + pulse * 0.8) * uOpacity);
}
```

> Never write `smoothstep(a, b, x)` with `a >= b`; GLSL leaves it undefined. Use `1.0 - smoothstep(b, a, x)`.

- [ ] **Step 2: Write `FrontEnd/src/three/NeuralScene.js`**

```js
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineSegments,
  PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from "three";
import { buildFormations } from "./formations.js";
import { buildEdges, edgeLengths } from "./graph.js";
import common from "./shaders/common.glsl?raw";
import nodeVert from "./shaders/node.vert.glsl?raw";
import nodeFrag from "./shaders/node.frag.glsl?raw";
import edgeVert from "./shaders/edge.vert.glsl?raw";
import edgeFrag from "./shaders/edge.frag.glsl?raw";

const AMBER = new Color("#f59e0b");
const HOT = new Color("#ff3b30");
const PROJECTS = 3;

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
    this.highlight = { cluster: -1, amount: 0, target: 0 };
    this.pointerTarget = { x: 0, y: 0 };
    this.px = 0;
    this.py = 0;
    this.spin = 0;
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

  setFormation(from, to, mix) {
    this.formation = { from, to, mix };
    this.uniforms.uFrom.value = from;
    this.uniforms.uTo.value = to;
    this.uniforms.uMix.value = mix;
    this.camera.position.z = 8 - (from + mix) * 0.25;
    this.#renderIfStatic();
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
    const { from, to, mix } = this.formation;
    if (this.animate) {
      this.uniforms.uTime.value += dt;
      this.spin += dt * 0.05 * (from === 0 ? 1 - mix : 0);
    }
    const k = this.animate ? Math.min(1, dt * 3) : 1;
    this.px += (this.pointerTarget.x * 0.15 - this.px) * k;
    this.py += (this.pointerTarget.y * 0.15 - this.py) * k;
    this.group.rotation.set(-this.py, this.spin + this.px, 0);

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
```

- [ ] **Step 3: Write `FrontEnd/src/components/NeuralCanvas.css`**

```css
.neural-canvas,
.neural-fallback {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100lvh;
  z-index: 0;
  pointer-events: none;
}

.neural-fallback {
  background:
    radial-gradient(60% 50% at 50% 45%, rgba(var(--color-accent-rgb), 0.18), transparent 70%),
    var(--color-bg);
}
```

- [ ] **Step 4: Write `FrontEnd/src/components/NeuralCanvas.jsx`**

```jsx
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { resolveFormation } from "../three/scrollMap.js";
import { createQualityMonitor } from "../three/quality.js";
import { HIGHLIGHT_EVENT } from "../three/events.js";
import { SECTION_IDS } from "../data/sections.js";
import "./NeuralCanvas.css";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// layout top (ignores transforms, so ScrollSmoother's translate doesn't skew it)
function absoluteTop(el) {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
}

export default function NeuralCanvas({ onReady }) {
  const canvasRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(hover: none)").matches || window.innerWidth < 768;
    const cleanups = [];
    let scene = null;
    let cancelled = false;

    const fail = (err) => {
      if (cancelled) return;
      console.warn("NeuralCanvas: WebGL unavailable, showing fallback.", err);
      setFailed(true);
      onReadyRef.current?.();
    };

    import("../three/NeuralScene.js")
      .then(({ default: NeuralScene }) => {
        if (cancelled) return;
        try {
          if (new URLSearchParams(window.location.search).has("nowebgl")) {
            throw new Error("disabled by ?nowebgl");
          }
          scene = new NeuralScene(canvas, {
            nodeCount: mobile ? 500 : 1400,
            dpr: mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
            animate: !reduced,
          });
        } catch (err) {
          fail(err);
          return;
        }

        const monitor = createQualityMonitor();
        scene.onFrame = (dt) => {
          if (monitor.tier === "high" && monitor.sample(dt) === "low") scene.setQuality("low");
        };

        let tops = [];
        const measure = () => {
          tops = SECTION_IDS.map((id) => {
            const el = document.getElementById(id);
            return el ? absoluteTop(el) : Infinity;
          });
        };
        measure();
        ScrollTrigger.addEventListener("refresh", measure);
        cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measure));

        let lastKey = "";
        const sync = () => {
          const smoother = ScrollSmoother.get();
          const y = smoother ? smoother.scrollTop() : window.scrollY;
          const f = resolveFormation(y, window.innerHeight, tops);
          const mix = reduced ? (f.mix >= 0.5 ? 1 : 0) : f.mix;
          const key = `${f.from}:${f.to}:${mix.toFixed(4)}`;
          if (key === lastKey) return;
          lastKey = key;
          scene.setFormation(f.from, f.to, mix);
        };
        gsap.ticker.add(sync);
        cleanups.push(() => gsap.ticker.remove(sync));

        if (!mobile && !reduced) {
          const move = (e) =>
            scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
          window.addEventListener("mousemove", move, { passive: true });
          cleanups.push(() => window.removeEventListener("mousemove", move));
        }

        const onHighlight = (e) => scene.highlightCluster(e.detail.cluster);
        window.addEventListener(HIGHLIGHT_EVENT, onHighlight);
        cleanups.push(() => window.removeEventListener(HIGHLIGHT_EVENT, onHighlight));

        const onResize = () => scene.resize();
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        const onVisibility = () => (document.hidden ? scene.pause() : scene.resume());
        document.addEventListener("visibilitychange", onVisibility);
        cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

        scene.start();
        requestAnimationFrame(() => {
          if (!cancelled) onReadyRef.current?.();
        });
      })
      .catch(fail);

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      scene?.dispose();
    };
  }, []);

  return failed ? (
    <div className="neural-fallback" aria-hidden="true" />
  ) : (
    <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
  );
}
```

- [ ] **Step 5: Mount in `Home.jsx` and remove the video**

1. Add import: `import NeuralCanvas from "../components/NeuralCanvas";`
2. Delete `const videoRef = useRef(null);` and `const videoWrapRef = useRef(null);`.
3. In the first effect, replace `tl.from(videoRef.current, { opacity: 0, duration: 1.6 })` with `tl.from(".neural-canvas, .neural-fallback", { opacity: 0, duration: 1.6 })`.
4. Delete the hero parallax block: the `quickX`/`quickY` lines, `heroRafId`, `handleMouseMove`, its `addEventListener`, and `removeMouseMove = () => {…}`. Also delete `let removeMouseMove = () => { };` and the `removeMouseMove();` call in the cleanup.
5. In JSX, render `<NeuralCanvas />` directly after the Loader line, **outside** `#smooth-wrapper`.
6. Delete the whole `<div className="hero-video-wrap" ref={videoWrapRef}>…</div>` block.
7. Change `<div className="home">` to `<div className="home" id="hero">` and `<section className="about-section">` to `<section className="about-section" id="about">`.

- [ ] **Step 6: Make sections see-through in CSS**

`FrontEnd/src/pages/Home.css`:
- `.home` → `background: transparent;`
- `#smooth-wrapper` → add `z-index: 1;`
- Delete the `.hero-video-wrap`, `.hero-video` and `@keyframes heroZoom` rules.
- `.hero-overlay` → replace its `background` with `linear-gradient(to bottom, rgba(10, 10, 10, 0.55) 0%, transparent 30%, transparent 65%, rgba(10, 10, 10, 0.8) 100%);`
- `.about-section` → `background: transparent;`

`FrontEnd/src/components/Experience.css` `.experience-section` → `background: transparent;`
`FrontEnd/src/components/Projects.css` `.projects-section` → `background-color: transparent;` (keep the grid `background-image`).

- [ ] **Step 7: Run gates**

Run: `npx vitest run && npx eslint . && npx vite build`
Expected:
- tests pass
- lint shows 0 errors and the 1 known warning
- build emits a separate `NeuralScene-*.js` chunk

- [ ] **Step 8: Browser check — graph renders**

Start the dev server (`preview_start` name `portfolio-dev`), open `http://localhost:5173`, wait 8 s, screenshot.
Expected:
- the amber node cloud is visible behind the hero headline; there is no video
- `read_console_messages` with `onlyErrors: true` → none

- [ ] **Step 9: Browser check — WebGL fallback (Review Focus 1)**

Navigate to `http://localhost:5173/?nowebgl`, wait 8 s, screenshot.
Expected:
- the radial amber gradient fallback shows and the loader exits
- the console has exactly one warning `NeuralCanvas: WebGL unavailable…` and no errors

- [ ] **Step 10: Commit** (only with user OK)

```bash
git add FrontEnd/src/three FrontEnd/src/components/NeuralCanvas.* FrontEnd/src/pages FrontEnd/src/components/Experience.css FrontEnd/src/components/Projects.css
git commit -m "feat(three): full-page neural graph canvas replaces hero video"
```

---

### Task 4: Theme, fonts and performance cleanup

**Files:**
- Modify: `FrontEnd/src/styles/theme.css`, `FrontEnd/index.html`, `FrontEnd/src/pages/Home.jsx`, `FrontEnd/src/components/Contact.css`
- Delete: `FrontEnd/public/hero.mp4`

**Interfaces:**
- Produces: CSS tokens `--color-accent`, `--color-accent-rgb`, `--color-accent-secondary(-rgb)`, `--color-hot`, `--color-hot-rgb`, `--font-display`, `--font-mono`, `--font-body`, `--font-hud`.

- [ ] **Step 1: Record the baseline bundle**

Run: `npx vite build 2>&1 | grep -E "kB"`
Write the gzip numbers for `index-*.js`, `index-*.css` and `NeuralScene-*.js` into your notes for Task 9.

- [ ] **Step 2: Replace the top of `FrontEnd/src/styles/theme.css`**

Delete the `@import url(...)` line. Replace the `:root` block with:

```css
:root {
  --color-bg: #0a0a0a;
  --color-text: #edebe6;
  --color-text-dim: #8a8a8a;
  --color-accent: #f59e0b;
  --color-accent-rgb: 245, 158, 11;
  --color-accent-secondary: #ff8c42;
  --color-accent-secondary-rgb: 255, 140, 66;
  --color-hot: #ff3b30;
  --color-hot-rgb: 255, 59, 48;

  --font-display: 'Archivo', sans-serif;
  --font-mono: 'Space Grotesk', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;
  --font-hud: 'JetBrains Mono', ui-monospace, monospace;
}
```

> `--color-text-dim` goes from `#6b6b6b` to `#8a8a8a`: dim text now sits over a glowing canvas, and `#6b6b6b` on `#0a0a0a` is only 3.6:1 contrast.

- [ ] **Step 3: Load fonts once, trimmed, from `FrontEnd/index.html`**

Replace the font `<link href=…>` with:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Also fix the empty favicon tag: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. Under the title add `<meta name="description" content="Aariyan — full-stack and AI engineer. ARC, multi-tenant RAG, search engines, compilers." />`.

- [ ] **Step 4: Delete the video**

```bash
git rm FrontEnd/public/hero.mp4
```

Expected: `grep -rn "hero.mp4\|hero.webm" FrontEnd/src FrontEnd/index.html` prints nothing (Task 3 removed the `<video>`).

- [ ] **Step 5: Keep Contact dark — `FrontEnd/src/components/Contact.css`**

```bash
cd FrontEnd/src/components
sed -i '' \
  -e 's/background: #f0ede8;/background: transparent;/' \
  -e 's/#1a1a1e/var(--color-text)/g' \
  -e 's/#5a5a60/var(--color-text-dim)/g' \
  -e 's/rgba(0, 0, 0, 0.1)/rgba(255, 255, 255, 0.12)/g' \
  -e 's/rgba(0, 0, 0, 0.08)/rgba(255, 255, 255, 0.1)/g' \
  -e 's/rgba(0, 0, 0, 0.05)/rgba(255, 255, 255, 0.06)/g' \
  Contact.css
cd -
grep -nE "#1a1a1e|#f0ede8|rgba\(0, 0, 0" FrontEnd/src/components/Contact.css
```

Expected: the final grep prints nothing.

- [ ] **Step 6: Home.jsx — ScrollSmoother, drop the light flip, consolidate triggers**

1. At the top of the second effect (`[loaderDone]`) add `const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;` and change `ScrollSmoother.create({...})` to:

```js
const smoother = ScrollSmoother.create({
  wrapper: wrapperRef.current,
  content: contentRef.current,
  smooth: reduced ? 0 : 1.0,
  effects: !reduced,
  smoothTouch: false,
});
```

2. Delete the `gsap.to(".about-section", { … backgroundColor: "#141418" … })` block.
3. Delete both "whole-page dark → white world transition" `gsap.fromTo` blocks (`document.body` and `"#smooth-wrapper"`).
4. Replace the two projects-header tweens (`.projects-eyebrow, .projects-title .title-line, .projects-intro` and `.projects-header-line`) with one timeline:

```js
gsap.timeline({ scrollTrigger: { trigger: ".projects-section", start: "top 75%" }, defaults: { ease: "power3.out" } })
  .from(".projects-eyebrow, .projects-title .title-line, .projects-intro", { y: 40, opacity: 0, duration: 0.9, stagger: 0.1 })
  .to(".projects-header-line", { scaleX: 1, duration: 0.9 }, 0);
```

5. Replace the contact rule draw-in, the contact glow tween, and every "contact section reveal animations" tween (eyebrow, line, sub, email, social-link, footer) with one timeline. **Keep** the `.contact-watermark` scrub tween and the hover/magnetic code.

```js
gsap.timeline({ scrollTrigger: { trigger: ".contact-section", start: "top 75%" }, defaults: { ease: "power3.out" } })
  .to([".contact-rule--top", ".contact-rule--mid"], { scaleX: 1, duration: 1, stagger: 0.15 }, 0)
  .fromTo(".contact-glow", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }, 0)
  .from(".contact-eyebrow", { y: 24, opacity: 0, duration: 0.8 }, 0)
  .from(".contact-line", { y: 60, opacity: 0, duration: 1, stagger: 0.12 }, 0.2)
  .from(".contact-sub", { y: 30, opacity: 0, duration: 0.8 }, 0.5)
  .from(".contact-section .contact-email", { y: 30, opacity: 0, duration: 0.8 }, 0.6)
  .from(".contact-social-link", { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }, 0.75)
  .from(".contact-section .contact-footer", { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" }, 0.9);
```

> `.contact-email` and `.contact-footer` also exist inside the navbar's contact modal. Scope these to `.contact-section` so the modal is never touched.

- [ ] **Step 7: Run gates and compare bundle**

Run: `npx vitest run && npx eslint . && npx vite build 2>&1 | grep -E "kB"`
Expected:
- tests pass, lint is clean except the known warning
- `index-*.js` gzip is within ±3 KB of Step 1
- `dist/` contains no `hero.mp4`: `ls dist | grep -c mp4` prints `0`

- [ ] **Step 8: Browser check**

Reload `http://localhost:5173`, scroll to the bottom with `computer.scroll` (10 ticks at a time), and screenshot the contact section.
Expected:
- the background stays dark the whole way
- contact text is light and legible
- the amber accent replaces the red on the navbar CTA

- [ ] **Step 9: Commit** (only with user OK)

```bash
git add FrontEnd/index.html FrontEnd/src/styles/theme.css FrontEnd/src/pages/Home.jsx FrontEnd/src/components/Contact.css
git commit -m "perf: drop hero video, trim fonts, unify amber palette, consolidate scroll triggers"
```

---

### Task 5: HUD overlay, decode text, scanlines

**Files:**
- Create: `FrontEnd/src/hooks/useActiveSection.js`, `FrontEnd/src/components/Hud.jsx`, `FrontEnd/src/components/Hud.css`, `FrontEnd/src/components/DecodeText.jsx`
- Modify: `FrontEnd/src/pages/Home.jsx`, `FrontEnd/src/components/Projects.jsx`, `FrontEnd/src/components/Experience.jsx`, `FrontEnd/src/components/Contact.jsx`

**Interfaces:**
- Consumes: `SECTIONS`, `SECTION_IDS` (Task 1).
- Produces:
  - `useActiveSection(ids: string[]) => number` (index into `ids`, default 0)
  - `<Hud />`
  - `<DecodeText as?="span" text: string className? hover?=true />`

- [ ] **Step 1: Write `FrontEnd/src/hooks/useActiveSection.js`**

```js
import { useEffect, useState } from "react";

// Index of the section crossing the vertical middle of the viewport.
export default function useActiveSection(ids) {
  const [active, setActive] = useState(0);
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|");
    const els = list.map((id) => document.getElementById(id));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = els.indexOf(entry.target);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
```

- [ ] **Step 2: Write `FrontEnd/src/components/Hud.jsx`**

```jsx
import { useEffect, useRef, useState } from "react";
import useActiveSection from "../hooks/useActiveSection";
import { SECTIONS, SECTION_IDS } from "../data/sections";
import "./Hud.css";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function Hud() {
  const coordsRef = useRef(null);
  const [clock, setClock] = useState(() => clockFormat.format(new Date()));
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const id = setInterval(() => setClock(clockFormat.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!coordsRef.current) return;
        coordsRef.current.textContent =
          `X:${String(e.clientX).padStart(4, "0")} Y:${String(e.clientY).padStart(4, "0")}`;
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const section = SECTIONS[active] ?? SECTIONS[0];

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-bracket hud-bracket--tl" />
      <span className="hud-bracket hud-bracket--tr" />
      <span className="hud-bracket hud-bracket--bl" />
      <span className="hud-bracket hud-bracket--br" />
      <span className="hud-section">
        {String(active + 1).padStart(2, "0")} / {section.label}
      </span>
      <span className="hud-coords" ref={coordsRef}>X:0000 Y:0000</span>
      <span className="hud-clock">IST {clock}</span>
    </div>
  );
}
```

- [ ] **Step 3: Write `FrontEnd/src/components/Hud.css`**

```css
.hud {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  font-family: var(--font-hud);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(237, 235, 230, 0.45);
}

/* scanlines, 3% */
.hud::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 3px);
}

.hud-bracket {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 0 solid rgba(var(--color-accent-rgb), 0.6);
}
.hud-bracket--tl { top: 14px; left: 14px; border-top-width: 1px; border-left-width: 1px; }
.hud-bracket--tr { top: 14px; right: 14px; border-top-width: 1px; border-right-width: 1px; }
.hud-bracket--bl { bottom: 14px; left: 14px; border-bottom-width: 1px; border-left-width: 1px; }
.hud-bracket--br { bottom: 14px; right: 14px; border-bottom-width: 1px; border-right-width: 1px; }

.hud-section { position: absolute; top: 84px; left: 44px; color: rgba(var(--color-accent-rgb), 0.9); }
.hud-coords { position: absolute; top: 84px; right: 44px; }
.hud-clock { position: absolute; top: 102px; right: 44px; }

@media (max-width: 767px) {
  .hud-bracket, .hud-coords, .hud-clock { display: none; }
  .hud-section { top: auto; bottom: 14px; left: 16px; }
}
```

- [ ] **Step 4: Write `FrontEnd/src/components/DecodeText.jsx`**

```jsx
import { createElement, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const CHARS = "!<>-_\\/[]{}=+*^?#01";

export default function DecodeText({ as = "span", text, className, hover = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const run = (duration) =>
      gsap.to(el, {
        duration,
        ease: "none",
        overwrite: true,
        scrambleText: { text, chars: CHARS, speed: 0.6, revealDelay: 0.1 },
      });

    const st = ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => run(1) });
    const onEnter = () => run(0.6);
    if (hover) el.addEventListener("mouseenter", onEnter);

    return () => {
      st.kill();
      gsap.killTweensOf(el);
      if (hover) el.removeEventListener("mouseenter", onEnter);
      el.textContent = text;
    };
  }, [text, hover]);

  return createElement(as, { ref, className }, text);
}
```

- [ ] **Step 5: Mount the HUD and remove the hero frame corners — `Home.jsx`**

1. `import Hud from "../components/Hud";` — render `<Hud />` right after `<NeuralCanvas />`.
2. Delete the `<div className="frame-corners">…</div>` block.
3. In the hero timeline, replace `.from(".frame-corners .corner", { opacity: 0, scale: 0.5, duration: 0.6, stagger: 0.05 }, "-=0.4")` with `.from(".hud", { opacity: 0, duration: 0.8 }, "-=0.4")`.
4. `import DecodeText from "../components/DecodeText";` and change:
   - `<div className="edge-label">FULL-STACK DEVELOPER</div>` → `<DecodeText as="div" className="edge-label" text="FULL-STACK DEVELOPER" hover={false} />`
   - `<p className="about-label">ABOUT ME</p>` → `<DecodeText as="p" className="about-label" text="ABOUT ME" />`

- [ ] **Step 6: Decode the other eyebrows**

- `Projects.jsx`: `<p className="projects-eyebrow">SELECTED WORK — 2026</p>` → `<DecodeText as="p" className="projects-eyebrow" text="SELECTED WORK — 2026" />`
- `Experience.jsx`: inside `.exp-header-label`, `<span>CAREER PATH</span>` → `<DecodeText text="CAREER PATH" />`
- `Contact.jsx`: the eyebrow's text node `OPEN FOR WORK — 2026` → `<DecodeText text="OPEN FOR WORK — 2026" />`, keeping the dot span before it.

Add `import DecodeText from "./DecodeText";` to each of these three files.

- [ ] **Step 7: Gates + browser check**

Run: `npx vitest run && npx eslint . && npx vite build`
Expected: green (the known Loader warning only).

Browser: reload, screenshot the hero, then hover the "SELECTED WORK" eyebrow.
Expected:
- the HUD brackets, `01 / INTRO`, coords and IST clock are visible and overlap nothing in the hero (`.hero-meta`, `.edge-label`)
- the eyebrow scrambles and settles on the exact original text
- the section label changes to `04 / WORK` at the projects section
- at the 375×812 viewport (`resize_window` preset `mobile`) only the section label shows, bottom-left

- [ ] **Step 8: Commit** (only with user OK)

```bash
git add FrontEnd/src/hooks/useActiveSection.js FrontEnd/src/components/Hud.* FrontEnd/src/components/DecodeText.jsx FrontEnd/src/pages/Home.jsx FrontEnd/src/components/Projects.jsx FrontEnd/src/components/Experience.jsx FrontEnd/src/components/Contact.jsx
git commit -m "feat(ui): HUD overlay, scanlines and decode-text eyebrows"
```

---

### Task 6: Boot loader with safe exit gate, reticle cursor, glass navbar

**Files:**
- Create: `FrontEnd/src/lib/gate.js`, `FrontEnd/src/lib/gate.test.js`
- Modify: `FrontEnd/src/components/Loader.jsx`, `Loader.css`, `CustomCursor.jsx`, `CustomCursor.css`, `Navbar.jsx`, `Navbar.css`, `FrontEnd/src/pages/Home.jsx`

**Interfaces:**
- Consumes: `useActiveSection`, `DecodeText` (Task 5); `SECTIONS`, `SECTION_IDS` (Task 1); `NeuralCanvas onReady` (Task 3).
- Produces: `createGate({ timeoutMs = 5000, onOpen }) => { reach(), open(), dispose(), fired }`; `<Loader onFinish ready />`.

- [ ] **Step 1: Write the failing gate test** — `FrontEnd/src/lib/gate.test.js`

```js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createGate } from "./gate.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createGate", () => {
  it("fires only after both reach() and open()", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.reach();
    expect(onOpen).not.toHaveBeenCalled();
    g.open();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("works in either order", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.open();
    g.reach();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("fires once even if called repeatedly", () => {
    const onOpen = vi.fn();
    const g = createGate({ onOpen });
    g.reach(); g.open(); g.open(); g.reach();
    vi.advanceTimersByTime(10_000);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(g.fired).toBe(true);
  });

  it("opens by itself after the timeout when the scene never reports ready", () => {
    const onOpen = vi.fn();
    const g = createGate({ timeoutMs: 5000, onOpen });
    g.reach();
    vi.advanceTimersByTime(4999);
    expect(onOpen).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("dispose cancels the timeout", () => {
    const onOpen = vi.fn();
    const g = createGate({ timeoutMs: 100, onOpen });
    g.reach();
    g.dispose();
    vi.advanceTimersByTime(1000);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npx vitest run src/lib/gate.test.js`
Expected: FAIL — cannot resolve `./gate.js`.

- [ ] **Step 3: Write `FrontEnd/src/lib/gate.js`**

```js
// Two conditions must both be true before onOpen runs once:
// the loader animation reached its exit point (reach), and the scene is ready (open).
// The timeout forces "open" so a slow or broken scene can never trap the user in the loader.
export function createGate({ timeoutMs = 5000, onOpen }) {
  let isReached = false;
  let isOpen = false;
  let fired = false;
  let timer = null;

  const fire = () => {
    if (!isReached || !isOpen || fired) return;
    fired = true;
    clearTimeout(timer);
    onOpen();
  };

  timer = setTimeout(() => {
    isOpen = true;
    fire();
  }, timeoutMs);

  return {
    reach() { isReached = true; fire(); },
    open() { isOpen = true; fire(); },
    dispose() { clearTimeout(timer); },
    get fired() { return fired; },
  };
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npx vitest run src/lib/gate.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Rewrite `FrontEnd/src/components/Loader.jsx`**

```jsx
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getGreetingsForBucket } from "../data/greetings";
import { createGate } from "../lib/gate";
import "./Loader.css";

function getTimeBucket() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 21) return "evening";
  return "night";
}

const BOOT = "initializing neural graph…";

export default function Loader({ onFinish, ready }) {
  const wrapRef = useRef(null);
  const reelRef = useRef(null);
  const glowRef = useRef(null);
  const underlineRef = useRef(null);
  const bootRef = useRef(null);
  const gateRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  const [bucket] = useState(getTimeBucket);

  const [words] = useState(() => {
    const all = getGreetingsForBucket(bucket);
    const english = all.find((w) => w.lang === "English");
    const rest = gsap.utils.shuffle(all.filter((w) => w.lang !== "English"));
    return [...rest, english];
  });

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const reel = reelRef.current;
    const itemH = reel.firstChild.offsetHeight;
    const lastIndex = words.length - 1;
    const lastItem = reel.lastChild;
    const pct = { v: 0 };
    const setBoot = (n) => {
      if (bootRef.current) bootRef.current.textContent = `${BOOT} ${n}%`;
    };

    gsap.set(reel, { y: 0 });
    gsap.set([glowRef.current, underlineRef.current], { opacity: 0 });

    const tl = gsap.timeline();
    // play on the next frame: resuming from inside GSAP's own addPause callback is not reliable
    const gate = createGate({ timeoutMs: 5000, onOpen: () => { setBoot(100); requestAnimationFrame(() => tl.play()); } });
    gateRef.current = gate;

    tl.to(reel, { y: -lastIndex * itemH, duration: 2.6, ease: "power4.out" }, 0)
      .fromTo(reel, { filter: "blur(9px)" }, { filter: "blur(0px)", duration: 2.6, ease: "power4.out" }, 0)
      .to(pct, {
        v: 90,
        duration: 2.6,
        ease: "power2.out",
        onUpdate: () => setBoot(gate.fired ? 100 : Math.round(pct.v)),
      }, 0)
      .addLabel("landed")
      .fromTo(lastItem, { scale: 0.9 }, { scale: 1.08, duration: 0.26, ease: "back.out(3)" }, "landed")
      .to(lastItem, { scale: 1, duration: 0.22, ease: "power2.out" }, "landed+=0.26")
      .to(glowRef.current, { opacity: 1, scale: 1.15, duration: 0.5, ease: "power2.out" }, "landed")
      .to(glowRef.current, { opacity: 0, duration: 0.5, ease: "power2.in" }, "landed+=0.9")
      .fromTo(underlineRef.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.45, ease: "power3.out" }, "landed+=0.05")
      .addPause("landed+=1.1", () => gate.reach())
      .to(wrapRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          onFinishRef.current?.();
        },
      }, "landed+=1.1");

    return () => {
      gate.dispose();
      gateRef.current = null;
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [words]);

  useEffect(() => {
    if (ready) gateRef.current?.open();
  }, [ready]);

  return (
    <div className="loader" ref={wrapRef}>
      <div className="loader-stage">
        <div className="loader-glow" ref={glowRef} />
        <div className="loader-window">
          <div className="loader-reel" ref={reelRef}>
            {words.map((w) => (
              <span className="loader-item" key={w.lang}>{w.text}</span>
            ))}
          </div>
        </div>
        <span className="loader-underline" ref={underlineRef} />
      </div>
      <p className="loader-boot" ref={bootRef}>{BOOT} 0%</p>
    </div>
  );
}
```

Append to `FrontEnd/src/components/Loader.css`:

```css
.loader-boot {
  position: absolute;
  left: 50%;
  bottom: 12vh;
  transform: translateX(-50%);
  margin: 0;
  font-family: var(--font-hud);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(var(--color-accent-rgb), 0.85);
}
```

- [ ] **Step 6: Wire ready state and move the Navbar out of the smooth content — `Home.jsx`**

1. `import { useCallback, useEffect, useRef, useState } from "react";`
2. Add `const [sceneReady, setSceneReady] = useState(false);` and `const handleSceneReady = useCallback(() => setSceneReady(true), []);`.
3. `<Loader onFinish={handleLoaderFinish} ready={sceneReady} />` and `<NeuralCanvas onReady={handleSceneReady} />`.
4. Move `<Navbar />` from inside `.home` to just after `<Hud />`, outside `#smooth-wrapper`. A `position: fixed` element inside ScrollSmoother's transformed content scrolls away with it.

- [ ] **Step 7: Reticle cursor — rewrite `FrontEnd/src/components/CustomCursor.jsx`**

```jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./CustomCursor.css";

const INTERACTIVE = "a, button, .navbar-link, .navbar-cta, .contact-social-link";

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const touch = matchMedia("(hover: none)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch || reduced) {
      ring.style.display = "none";
      dot.style.display = "none";
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    let snapEl = null;

    const move = (e) => {
      dx(e.clientX);
      dy(e.clientY);
      if (snapEl) {
        const r = snapEl.getBoundingClientRect();
        rx(r.left + r.width / 2);
        ry(r.top + r.height / 2);
      } else {
        rx(e.clientX);
        ry(e.clientY);
      }
    };

    const over = (e) => {
      const mag = e.target.closest("[data-magnetic]");
      if (mag) {
        snapEl = mag;
        const r = mag.getBoundingClientRect();
        ring.style.setProperty("--snap-w", `${r.width + 18}px`);
        ring.style.setProperty("--snap-h", `${r.height + 14}px`);
        ring.classList.add("cursor--snap");
        return;
      }
      if (e.target.closest(".project-card")) {
        ring.classList.add("cursor--view");
        if (labelRef.current) labelRef.current.textContent = "VIEW";
        return;
      }
      if (e.target.closest(INTERACTIVE)) ring.classList.add("cursor--hover");
    };

    const out = (e) => {
      const to = e.relatedTarget;
      if (snapEl && (!to || !snapEl.contains(to))) {
        snapEl = null;
        ring.classList.remove("cursor--snap");
      }
      if (e.target.closest(".project-card") && !(to && to.closest?.(".project-card"))) {
        ring.classList.remove("cursor--view");
      }
      if (e.target.closest(INTERACTIVE) && !(to && to.closest?.(INTERACTIVE))) {
        ring.classList.remove("cursor--hover");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div className="custom-cursor" ref={ringRef}>
        <span className="custom-cursor-label" ref={labelRef} />
      </div>
      <div className="custom-cursor-dot" ref={dotRef} />
    </>
  );
}
```

Append to `FrontEnd/src/components/CustomCursor.css`. Also add `.custom-cursor-dot` to the existing `@media (hover: none), (max-width: 700px)` hide rule.

```css
.custom-cursor { border-color: rgba(var(--color-accent-rgb), 0.55); mix-blend-mode: normal; }

.custom-cursor.cursor--snap {
  width: var(--snap-w);
  height: var(--snap-h);
  border-radius: 10px;
  opacity: 1;
  border-color: rgba(var(--color-accent-rgb), 0.9);
  box-shadow: 0 0 18px rgba(var(--color-accent-rgb), 0.35);
}

.custom-cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  background:
    linear-gradient(var(--color-accent), var(--color-accent)) center / 1px 100% no-repeat,
    linear-gradient(var(--color-accent), var(--color-accent)) center / 100% 1px no-repeat;
}
```

Add `data-magnetic` to:
- `.navbar-cta` (Navbar.jsx)
- `.contact-email` in Contact.jsx (the section one, not the modal)
- `.pside-github` in Projects.jsx

- [ ] **Step 8: Glass pill navbar with active-section indicator — `Navbar.jsx`**

1. Add imports:

```js
import DecodeText from "./DecodeText";
import useActiveSection from "../hooks/useActiveSection";
import { SECTIONS, SECTION_IDS } from "../data/sections";
```

2. Inside the component, add:

```jsx
const linksRef = useRef(null);
const indicatorRef = useRef(null);
const active = useActiveSection(SECTION_IDS);
const activeId = SECTION_IDS[active];

useEffect(() => {
  const indicator = indicatorRef.current;
  const link = linksRef.current?.querySelector(`[data-section="${activeId}"]`);
  if (!indicator) return;
  if (!link) {
    gsap.to(indicator, { opacity: 0, duration: 0.3 });
    return;
  }
  gsap.to(indicator, { x: link.offsetLeft, width: link.offsetWidth, opacity: 1, duration: 0.5, ease: "power3.out" });
}, [activeId]);

const handleSectionClick = (e, id) => {
  e.preventDefault();
  const target = document.getElementById(id);
  if (target) scrollToTarget(target);
};
```

3. Delete `handleProjectsClick`. At module level, below `scrollToTarget`, add `const NAV = SECTIONS.filter((s) => s.nav);`.
4. Replace the `<nav className="navbar-links">…</nav>` block:

```jsx
<nav className="navbar-links" ref={linksRef}>
  <span className="navbar-indicator" ref={indicatorRef} aria-hidden="true" />
  {NAV.map((s) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      data-section={s.id}
      className={`navbar-link${activeId === s.id ? " is-active" : ""}`}
      onClick={(e) => handleSectionClick(e, s.id)}
    >
      <DecodeText text={s.label} />
    </a>
  ))}
  <a href="https://www.linkedin.com/in/aariyan-s/" target="_blank" rel="noopener noreferrer" className="navbar-link">
    <LinkedinIcon className="navbar-icon" />
    <DecodeText text="LINKEDIN" />
  </a>
</nav>
```

5. Add `data-magnetic` to the `.navbar-cta` button.

> The email link leaves the nav bar. Email stays reachable from the CONTACT ME modal and the contact section.

Append to `FrontEnd/src/components/Navbar.css`:

```css
.navbar {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: none;
}

.navbar-links {
  position: relative;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(16, 16, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.navbar-indicator {
  position: absolute;
  left: 0;
  bottom: 4px;
  height: 2px;
  width: 0;
  opacity: 0;
  border-radius: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 10px rgba(var(--color-accent-rgb), 0.8);
}

.navbar-link.is-active { color: var(--color-text); }

@media (max-width: 767px) {
  .navbar-indicator { display: none; }
}
```

- [ ] **Step 9: Gates**

Run: `npx vitest run && npx eslint . && npx vite build`
Expected: all tests pass. Lint shows **0 errors, 0 warnings**; the Loader deps warning is gone because the effect reads `onFinishRef`.

- [ ] **Step 10: Browser check**

Reload. Expected:
- the loader shows `INITIALIZING NEURAL GRAPH… N%`, reaches `100%` and exits
- the navbar stays fixed while scrolling, and the amber underline slides under ABOUT / EXPERIENCE / WORK as you pass each section
- hovering CONTACT ME snaps the cursor ring to the button outline
- `?nowebgl` still exits the loader (ready fires on failure)

- [ ] **Step 11: Commit** (only with user OK)

```bash
git add FrontEnd/src/lib FrontEnd/src/components/Loader.* FrontEnd/src/components/CustomCursor.* FrontEnd/src/components/Navbar.* FrontEnd/src/pages/Home.jsx FrontEnd/src/components/Contact.jsx FrontEnd/src/components/Projects.jsx
git commit -m "feat(ui): boot loader with timeout gate, reticle cursor, glass navbar"
```

---

### Task 7: Projects — featured cards from data, holo border, cluster highlight, archive

**Files:**
- Create: `FrontEnd/src/components/ProjectArchive.jsx`, `FrontEnd/src/components/ProjectArchive.css`
- Modify: `FrontEnd/src/components/Projects.jsx`, `FrontEnd/src/components/Projects.css`

**Interfaces:**
- Consumes: `FEATURED`, `ARCHIVE`, `CATEGORIES`, `CATEGORY_LABEL`, `STATS` (Task 1); `emitHighlight` (Task 2); `DecodeText` (Task 5).
- Produces: `<ProjectArchive items: ArchiveItem[] onOpen: (item) => void />`.

- [ ] **Step 1: Write `FrontEnd/src/components/ProjectArchive.jsx`**

```jsx
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "../data/projects";
import "./ProjectArchive.css";

export default function ProjectArchive({ items, onOpen }) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => Object.fromEntries(
      CATEGORIES.map((c) => [c.id, c.id === "all" ? items.length : items.filter((p) => p.category === c.id).length]),
    ),
    [items],
  );
  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((p) => p.category === filter)),
    [items, filter],
  );

  return (
    <div className="parchive">
      <div className="parchive-head">
        <p className="parchive-eyebrow">ARCHIVE — {items.length} MORE</p>
        <div className="parchive-filters" role="group" aria-label="Filter projects by category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              className={`parchive-chip${filter === c.id ? " is-active" : ""}`}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
              <span className="parchive-chip-count">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="parchive-list">
        {visible.map((p) => {
          const cells = (
            <>
              <span className="parchive-year">{p.year}</span>
              <span className="parchive-title">{p.title}</span>
              <span className="parchive-desc">{p.description}</span>
              <span className="parchive-lang">{p.lang}</span>
              <span className="parchive-stars">{p.stars > 0 ? `★ ${p.stars}` : ""}</span>
              <ArrowUpRight size={16} className="parchive-arrow" aria-hidden="true" />
            </>
          );
          return (
            <li key={p.id} className="parchive-row">
              {p.href ? (
                <a className="parchive-link" href={p.href} target="_blank" rel="noreferrer">{cells}</a>
              ) : (
                <button type="button" className="parchive-link" onClick={() => onOpen(p)}>{cells}</button>
              )}
              {p.live && (
                <a className="parchive-live" href={p.live} target="_blank" rel="noreferrer">LIVE ↗</a>
              )}
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && <p className="parchive-empty">Nothing in this category yet.</p>}
    </div>
  );
}
```

- [ ] **Step 2: Write `FrontEnd/src/components/ProjectArchive.css`**

```css
.parchive { position: relative; z-index: 1; margin-top: 96px; }

.parchive-head {
  display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between;
  gap: 20px; margin-bottom: 28px;
}

.parchive-eyebrow {
  margin: 0; font-family: var(--font-hud); font-size: 11px; letter-spacing: 0.16em;
  color: rgba(var(--color-accent-rgb), 0.9);
}

.parchive-filters { display: flex; flex-wrap: wrap; gap: 8px; }

.parchive-chip {
  font: 500 12px/1 var(--font-mono); letter-spacing: 0.06em;
  color: var(--color-text-dim); background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 999px;
  padding: 9px 14px; cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.parchive-chip:hover { color: var(--color-text); border-color: rgba(var(--color-accent-rgb), 0.5); }
.parchive-chip.is-active { color: #0a0a0a; background: var(--color-accent); border-color: var(--color-accent); }
.parchive-chip-count { margin-left: 6px; opacity: 0.6; }

.parchive-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); }

.parchive-row {
  position: relative; display: flex; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.parchive-row::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, rgba(var(--color-accent-rgb), 0.12), transparent 70%);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.parchive-row:hover::before,
.parchive-row:focus-within::before { transform: scaleX(1); }

.parchive-link {
  flex: 1; display: grid;
  grid-template-columns: 56px minmax(160px, 1.1fr) 2fr 110px 56px 20px;
  align-items: center; gap: 16px; padding: 18px 8px;
  color: inherit; text-decoration: none; text-align: left;
  background: none; border: 0; font: inherit; cursor: pointer;
}

.parchive-year, .parchive-lang, .parchive-stars {
  font-family: var(--font-hud); font-size: 11px; letter-spacing: 0.08em; color: var(--color-text-dim);
}
.parchive-title { font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--color-text); }
.parchive-desc { font-size: 13px; line-height: 1.5; color: var(--color-text-dim); }
.parchive-arrow { color: var(--color-text-dim); transition: transform 0.3s, color 0.3s; }
.parchive-row:hover .parchive-arrow { color: var(--color-accent); transform: translate(3px, -3px); }

.parchive-live {
  margin: 0 8px 0 4px; padding: 5px 8px; border-radius: 4px; white-space: nowrap;
  font-family: var(--font-hud); font-size: 10px; letter-spacing: 0.14em; text-decoration: none;
  color: #0a0a0a; background: var(--color-accent);
}

.parchive-empty { padding: 24px 8px; font-size: 13px; color: var(--color-text-dim); }

@media (max-width: 767px) {
  .parchive-link { grid-template-columns: 44px 1fr 20px; row-gap: 4px; }
  .parchive-desc { grid-column: 2 / 3; }
  .parchive-lang, .parchive-stars { display: none; }
}
```

- [ ] **Step 3: Rework `Projects.jsx`**

1. Delete the local `PROJECTS` and `STATS` arrays. In the tilt effect, `PROJECTS[i]?.accent` becomes `FEATURED[i]?.accent`.
2. Add imports:

```js
import { FEATURED, ARCHIVE, STATS, CATEGORY_LABEL } from "../data/projects";
import { emitHighlight } from "../three/events";
import ProjectArchive from "./ProjectArchive";
```

3. In the tilt effect's `onEnter` add `emitHighlight(i);`; in `onLeave` add `emitHighlight(null);`.
4. Replace `handleCardClick` so that a card **always** opens the modal (the modal carries the GitHub and Live buttons):

```js
const handleCardClick = (project, i) => setSelectedProject({ ...project, index: String(i + 1).padStart(2, "0") });
```

5. Change the grid map to `FEATURED.map((p, i) => …)`:
   - `key={p.id}`
   - `data-index={String(i + 1).padStart(2, "0")}`
   - `onClick={() => handleCardClick(p, i)}`
   - `onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), handleCardClick(p, i))}`
   - `onFocus={() => emitHighlight(i)}` and `onBlur={() => emitHighlight(null)}`
   - `<span className="project-card-index">{String(i + 1).padStart(2, "0")}</span>`
   - after `<span className="pcard-sweep" />`, add `<span className="pcard-holo" aria-hidden="true" />`
   - after the tags `div`, add:

```jsx
<ul className="project-card-metrics">
  {p.metrics.map((m) => <li className="project-card-metric" key={m}>{m}</li>)}
</ul>
```

6. After the closing `</div>` of `.projects-grid`, add `<ProjectArchive items={ARCHIVE} onOpen={setSelectedProject} />`.
7. In the modal:
   - index line: `<span className="project-modal-index">{selectedProject.index ?? CATEGORY_LABEL[selectedProject.category]}</span>`
   - render subtitle only when present: `{selectedProject.subtitle && <p className="project-modal-subtitle">{selectedProject.subtitle}</p>}`
   - accent bar: `style={{ background: selectedProject.accent ?? "var(--color-accent)" }}`
   - meta: `{selectedProject.status && <span className="project-modal-status">{selectedProject.status}</span>}`
   - tags guarded with `selectedProject.tags?.length > 0 &&`
   - below the tags:

```jsx
{selectedProject.metrics?.length > 0 && (
  <ul className="project-modal-metrics">
    {selectedProject.metrics.map((m) => <li key={m}>{m}</li>)}
  </ul>
)}
<div className="project-modal-actions">
  {selectedProject.href && (
    <a className="project-modal-link" href={selectedProject.href} target="_blank" rel="noreferrer">
      <ExternalLink size={14} /> View on GitHub
    </a>
  )}
  {selectedProject.live && (
    <a className="project-modal-link" href={selectedProject.live} target="_blank" rel="noreferrer">
      <ExternalLink size={14} /> Live demo
    </a>
  )}
</div>
```

   Delete the old single `href !== "#"` link block.

- [ ] **Step 4: Append to `FrontEnd/src/components/Projects.css`**

```css
/* glass without backdrop-filter: blur over the animating canvas would re-render every frame */
.project-card { background: rgba(16, 16, 20, 0.72); }

@property --holo-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }

.pcard-holo {
  position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: conic-gradient(from var(--holo-angle), transparent 0deg, var(--accent) 60deg, #ff8c42 120deg, transparent 180deg, transparent 360deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0; transition: opacity 0.4s ease;
}
.project-card:hover .pcard-holo,
.project-card:focus-visible .pcard-holo { opacity: 1; animation: holo-spin 3s linear infinite; }
@keyframes holo-spin { to { --holo-angle: 360deg; } }

.project-card-metrics { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; padding: 0; list-style: none; }
.project-card-metric,
.project-modal-metrics li {
  font-family: var(--font-hud); font-size: 10px; letter-spacing: 0.08em;
  color: var(--accent, var(--color-accent));
  border: 1px solid color-mix(in srgb, var(--accent, #f59e0b) 40%, transparent);
  background: color-mix(in srgb, var(--accent, #f59e0b) 8%, transparent);
  border-radius: 4px; padding: 4px 7px;
}
.project-modal-metrics { display: flex; flex-wrap: wrap; gap: 6px; margin: 18px 0 0; padding: 0; list-style: none; }
.project-modal-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }

@media (prefers-reduced-motion: reduce) {
  .project-card:hover .pcard-holo { animation: none; }
}
```

- [ ] **Step 5: Gates**

Run: `npx vitest run && npx eslint . && npx vite build`
Expected: green; lint 0/0.

- [ ] **Step 6: Browser check**

Scroll to Work. Expected:
- 8 cards show metric chips
- hovering a card spins its holo border, and one cluster of the constellation behind it brightens
- clicking a card opens the modal with GitHub (and Live, where present) buttons; Escape closes it
- the archive shows 22 rows; "Web" filters to 7; Gesture Home Switch (no repo) opens the modal; LIVE badges open the live sites
- `grep -rn "REPO-NAME" FrontEnd/src` prints nothing

- [ ] **Step 7: Commit** (only with user OK)

```bash
git add FrontEnd/src/components/Projects.* FrontEnd/src/components/ProjectArchive.*
git commit -m "feat(projects): featured cards from data, holo hover, constellation highlight, archive"
```

---

### Task 8: Experience glow + contact terminal

**Files:**
- Modify: `FrontEnd/src/components/Experience.jsx`, `Experience.css`, `Contact.jsx`, `Contact.css`

**Interfaces:**
- Consumes: GSAP `TextPlugin`, `ScrollTrigger`.

- [ ] **Step 1: Light up timeline nodes — `Experience.jsx`**

Inside the existing `gsap.context` (after the "Timeline Nodes pulse" block) add:

```js
gsap.utils.toArray(".exp-node").forEach((node) => {
  ScrollTrigger.create({ trigger: node, start: "top 55%", toggleClass: { targets: node, className: "is-lit" } });
});
```

Append to `Experience.css`:

```css
.exp-timeline-thread-fill { filter: drop-shadow(0 0 6px rgba(var(--color-accent-rgb), 0.8)); }
.exp-node .exp-node-inner { transition: background 0.4s ease, box-shadow 0.4s ease; }
.exp-node.is-lit .exp-node-inner {
  background: var(--color-accent);
  box-shadow: 0 0 18px 4px rgba(var(--color-accent-rgb), 0.7);
}
```

> `.experience-section` overrides `--color-accent` to white, so the glow there is white. That matches the section's existing monochrome look.

- [ ] **Step 2: Terminal line — `Contact.jsx`**

Add imports and the typing effect:

```jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const COMMAND = "send_message --to aariyan --priority high";
```

Inside the component:

```jsx
const termRef = useRef(null);

useEffect(() => {
  const el = termRef.current;
  if (!el) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = COMMAND;
    return;
  }
  const tween = gsap.to(el, {
    text: { value: COMMAND },
    duration: 1.8,
    ease: "none",
    scrollTrigger: { trigger: el, start: "top 85%" },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}, []);
```

Insert above the `<a className="contact-email" …>`:

```jsx
<p className="contact-terminal" aria-label={COMMAND}>
  <span className="contact-terminal-prompt" aria-hidden="true">&gt;</span>
  <span ref={termRef} aria-hidden="true" />
  <span className="contact-terminal-caret" aria-hidden="true" />
</p>
```

Append to `Contact.css`:

```css
.contact-terminal {
  display: flex; align-items: center; gap: 10px; margin: 0 0 18px;
  font-family: var(--font-hud); font-size: 13px; letter-spacing: 0.04em;
  color: rgba(var(--color-accent-rgb), 0.9);
}
.contact-terminal-prompt { color: var(--color-text-dim); }
.contact-terminal-caret {
  width: 8px; height: 15px; background: var(--color-accent);
  animation: caret-blink 1s steps(2, start) infinite;
}
@keyframes caret-blink { to { visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .contact-terminal-caret { animation: none; } }
```

- [ ] **Step 3: Gates + browser check**

Run: `npx vitest run && npx eslint . && npx vite build`
Expected: green.

Browser: scroll through Experience to Contact. Expected:
- timeline nodes glow as they cross mid-screen
- the graph collapses into the beacon behind Contact
- the terminal line types `send_message --to aariyan --priority high` with a blinking caret

- [ ] **Step 4: Commit** (only with user OK)

```bash
git add FrontEnd/src/components/Experience.* FrontEnd/src/components/Contact.*
git commit -m "feat(ui): glowing experience timeline and contact terminal prompt"
```

---

### Task 9: Whole-site verification

**Files:** none changed unless a check fails (fix in the owning task's files, then re-run this task).

- [ ] **Step 1: Gates**

Run: `npx vitest run && npx eslint . && npx vite build 2>&1 | grep -E "kB|built"`
Expected:
- all test files pass, lint 0/0, build succeeds
- record gzip sizes: `index-*.js` within +10 KB of the 128.7 KB baseline, and the `NeuralScene-*.js` chunk ≤ 150 KB gzip

- [ ] **Step 2: Transfer size**

Run: `du -sh dist && find dist -name "*.mp4" | wc -l`
Expected: `dist` under 1 MB; `0` mp4 files (it was about 8.3 MB with the video).

- [ ] **Step 3: Desktop screenshots**

`tabs_context` must report the pane visible — rAF is throttled in a hidden pane, so ask the user to show it if needed. With `resize_window` preset `desktop`, screenshot hero, about, experience, projects (hover a card) and contact.
Expected: all five formations are distinct and the text is readable over the graph.

- [ ] **Step 4: FPS sample during a scripted scroll**

Run via `javascript_tool`:

```js
await (async () => {
  const frames = [];
  let last = performance.now(), running = true;
  const tick = (t) => { frames.push(t - last); last = t; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const max = document.documentElement.scrollHeight - innerHeight;
  for (let y = 0; y <= max; y += 60) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)); }
  await new Promise((r) => setTimeout(r, 500));
  running = false;
  const mean = frames.slice(5).reduce((a, b) => a + b, 0) / Math.max(1, frames.length - 5);
  return { frames: frames.length, meanMs: +mean.toFixed(2), fps: +(1000 / mean).toFixed(1) };
})();
```

Expected: `fps ≥ 55` on desktop. Report the number either way.

- [ ] **Step 5: Mobile pass**

`resize_window` preset `mobile`, then reload. Screenshot each section and re-run Step 4.
Expected:
- no horizontal scroll: `document.documentElement.scrollWidth <= innerWidth` returns `true`
- HUD shows only the section label; archive rows use the 3-column layout
- report the fps (target ≥ 45 on real phones; the emulated number is only indicative)

Then `resize_window` preset `desktop`.

- [ ] **Step 6: Resize / orientation (spec risk)**

At desktop size, `resize_window` to 900×700 then back to desktop. Screenshot after each.
Expected: the canvas fills the viewport with no stretching, and formations still change at the right sections (ScrollTrigger refresh re-measures tops).

- [ ] **Step 7: Reduced motion**

Run via `javascript_tool`: `matchMedia("(prefers-reduced-motion: reduce)").matches`. If emulation is unavailable in the pane, check by code review instead and state that in the report. Each of these must branch on `prefers-reduced-motion`:
- `NeuralCanvas.jsx`
- `DecodeText.jsx`
- `CustomCursor.jsx`
- `Home.jsx` (smoother `smooth: 0`)
- `Contact.jsx`

Command: `grep -ln "prefers-reduced-motion" FrontEnd/src -r` must list all five.

- [ ] **Step 8: Console + fallback**

`read_console_messages` with `onlyErrors: true` → none. `http://localhost:5173/?nowebgl` → fallback plus loader exit, as in Task 3.

- [ ] **Step 9: Report**

Tell the user, in the final message:
- bundle sizes before and after
- desktop and mobile fps
- anything that missed its target, with the number

Do not claim a target was met without the number from Steps 1–5.
