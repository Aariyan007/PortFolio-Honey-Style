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
