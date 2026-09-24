import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ExternalLink } from "lucide-react";
import "./Projects.css";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    index: "01",
    title: "ARC",
    subtitle: "Remote AI Operating System Manager",
    year: "2026",
    status: "Ongoing",
    description:
      "A headless agentic daemon that runs autonomous OS tasks for any remote controller (web, CLI or mobile) over a single WebSocket streaming protocol, with local semantic routing and a fail-closed action verifier.",
    longDescription:
      "ARC is a headless agentic daemon built with FastAPI and Python that executes OS tasks on behalf of any remote client through one unified WebSocket protocol. A thread-safe persistent job store streams granular execution events (ack, clarify, execute, verify, result), so multi-turn tasks resolve asynchronously without network timeouts. Intent classification runs locally on SBERT (MiniLM) embeddings, routing 60+ OS actions in under 15ms and cutting cloud LLM API overhead by 76%. A fail-closed verifier snapshots the OS before and after every action to block destructive agent hallucinations, and a clarification system pauses active tasks when the agent needs more input. An autonomous Computer Use pipeline built on macOS Accessibility (AX) utilities and screen OCR is in progress, with graceful degradation and permission-aware error handling.",
    tags: ["FastAPI", "Python", "WebSockets", "SBERT", "TensorFlow", "macOS AX API"],
    href: "https://github.com/Aariyan007/ARC-REMOTE-DA",
    accent: "#a78bfa",
  },
  {
    index: "02",
    title: "Gesture Home Switch",
    subtitle: "Gesture-Controlled Wireless Home Appliance Switch",
    year: "2026",
    status: "College IoT project",
    description:
      "A wrist-worn gesture sensor talks to a stationary receiver over ESP-NOW to switch appliances on and off, with a cloud dashboard layered on top.",
    longDescription:
      "This IoT project uses an MPU6050 accelerometer/gyroscope on a wrist-worn ESP32 to recognize hand gestures in real-time. The recognized gesture is transmitted via ESP-NOW (a low-latency peer-to-peer protocol) to a receiver ESP32 connected to relay modules controlling home appliances. A companion web dashboard built with React provides remote monitoring and manual override.",
    tags: ["ESP32", "MPU6050", "ESP-NOW", "IoT"],
    href: "#",
    accent: "#a78bfa",
  },
  {
    index: "03",
    title: "Search Engine",
    subtitle: "Crawler → inverted index → BM25 + PageRank",
    year: "2026",
    status: "Completed",
    description:
      "A search engine built from scratch in Node.js: web crawler, text pipeline, inverted index, and results ranked by BM25 relevance fused with PageRank authority.",
    longDescription:
      "Crawls seed domains with axios and cheerio, extracts visible text, tokenizes and strips stopwords, then builds an inverted index. Queries are scored with BM25 (k1 = 1.5, b = 0.75) and blended with PageRank scores (damping 0.85, 10 iterations) at a 70/30 weight for the final ranking. Every stage writes plain JSON, so each phase can be run and inspected on its own.",
    tags: ["Node.js", "axios", "cheerio", "BM25", "PageRank"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#f59e0b",
  },
  {
    index: "04",
    title: "Docker Reverse Proxy",
    subtitle: "Auto-discovering round-robin load balancer",
    year: "2026",
    status: "Completed",
    description:
      "A Node.js reverse proxy that watches the Docker daemon, auto-registers containers as they start, and round-robins traffic across replicas with subdomain routing.",
    longDescription:
      "Listens to Docker events through dockerode, registers each container's IP from the proxy network under its service label, and removes it when the container dies. Requests to <service>.localhost are matched by subdomain and routed round-robin with http-proxy, WebSockets included. A small management API (POST /containers, GET /services) spins up replicated services. The registry is in-memory and there are no health checks yet.",
    tags: ["Node.js", "Docker", "dockerode", "http-proxy", "Express"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#38bdf8",
  },
  {
    index: "05",
    title: "Tracepoint",
    subtitle: "Structured logging + ingestion server",
    year: "2026",
    status: "Learning project",
    description:
      "A logging system built from scratch: a JSON logger library with pluggable transports, and an ingestion server with validation, token-bucket rate limiting and JSONL storage.",
    longDescription:
      "The client library adds timestamp, level and process ID, then ships logs through console, file or HTTP transports. The ingestion server validates each entry against a schema, rate-limits senders with a token bucket, and appends to JSONL files. A query API filters stored logs by service and severity with pagination. Async queueing, log rotation and API-key auth are the next steps.",
    tags: ["Node.js", "REST API", "JSONL", "Token Bucket", "Logging"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#34d399",
  },
  {
    index: "06",
    title: "NyayaAI",
    subtitle: "Legal document assistant for Indian law",
    year: "2025",
    status: "Working prototype",
    description:
      "Upload a legal PDF and get a plain-English explanation, risk flags, and a chat interface, grounded in a knowledge base of Indian legal acts.",
    longDescription:
      "A FastAPI backend extracts text with pdfplumber, detects the document type, and answers questions through a RAG pipeline: MiniLM sentence embeddings, a FAISS index over Indian legal acts, and Gemini for the explanations. Documents are stored in SQLite. Comes with a React chat frontend and a CLI for uploads, queries and knowledge-base rebuilds.",
    tags: ["FastAPI", "React", "Gemini", "FAISS", "RAG"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#fb7185",
  },
  {
    index: "07",
    title: "Moro",
    subtitle: "A compiler targeting Java, C and JVM bytecode",
    year: "2025",
    status: "Completed",
    description:
      "A tiny programming language with a full compiler pipeline that emits Java source, C source, and raw JVM bytecode.",
    longDescription:
      "Moro has a hand-written lexer, a recursive AST parser, and a semantic analyzer that checks variables are declared before use. Code generation targets Java and C source, and a separate bytecode generator writes .class files directly, with its own constant pool, class builder and method builder, so programs run on the JVM without javac.",
    tags: ["Java", "Compilers", "JVM Bytecode", "C"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#c084fc",
  },
  {
    index: "08",
    title: "3D Torus Renderer",
    subtitle: "Software rasterizer in Java",
    year: "2025",
    status: "Completed",
    description:
      "A 3D renderer written from scratch in Java Swing: no graphics library, just matrices, triangles, a z-buffer and barycentric rasterization.",
    longDescription:
      "Generates a torus mesh from major and minor segments, splits each quad into triangles, rotates vertices with a custom Matrix3 (heading and pitch from two sliders), then fills every triangle pixel by pixel using barycentric coordinates. A z-buffer keeps the nearest pixel and a simple lighting term shades each face.",
    tags: ["Java", "Swing", "Z-buffer", "Rasterization"],
    href: "https://github.com/Aariyan007/REPO-NAME", // TODO
    accent: "#facc15",
  },
  {
    index: "09",
    title: "Trav-Mov",
    subtitle: "Movies turned into travel itineraries",
    year: "2025",
    status: "Side project",
    description:
      "A MERN app that takes a favourite movie and generates a custom travel itinerary with Gemini. Built with Mathew MK, who designed it.",
    longDescription:
      "Users pick a movie, set their time and preferences, and Gemini generates an itinerary around its filming locations and themes. React, TailwindCSS and Framer Motion on the frontend with lazy loading and animations; Node, Express and MongoDB behind it.",
    tags: ["React", "Node.js", "MongoDB", "Gemini", "TailwindCSS"],
    href: "https://github.com/Aariyan007/Travel-Mov",
    accent: "#f97316",
  },
  {
    index: "10",
    title: "A-drive",
    subtitle: "A minimal Google Drive clone",
    year: "2025",
    status: "Completed",
    description:
      "Register, log in, upload and download files, in a clean lightweight take on Google Drive.",
    longDescription:
      "Node and Express backend with EJS views styled with Tailwind and Flowbite. Passwords are hashed with bcrypt and sessions use cookies, user data lives in MongoDB, and files are stored in Firebase Storage. A Spline 3D scene adds some visual polish.",
    tags: ["Node.js", "Express", "MongoDB", "Firebase", "EJS"],
    href: "https://github.com/Aariyan007/A-drive",
    accent: "#60a5fa",
  },
  {
    index: "11",
    title: "Waste Object Detection",
    subtitle: "Real-time detection with OpenCV + MobileNet",
    year: "2024",
    status: "Completed",
    description:
      "Real-time object detection that spots plastic and other waste and marks it with bounding boxes.",
    longDescription:
      "Runs a pretrained MobileNet SSD model through OpenCV on live video, highlights detected waste with red boxes, and exposes an adjustable confidence threshold to trade off precision against recall. Aimed at environmental monitoring.",
    tags: ["Python", "OpenCV", "MobileNet SSD", "Computer Vision"],
    href: "https://github.com/Aariyan007/Object-detection",
    accent: "#4ade80",
  },
];

const STATS = [
  { value: "55+", label: "Repos on GitHub", tag: null },
  { value: "12+", label: "Open Source PRs", tag: null },
  { value: "✓", label: "Hacktoberfest 2025", tag: "COMPLETED" },
  { value: "3+", label: "Years Coding", tag: null },
];

export default function ProjectsSection() {
  const linesRef = useRef([]);
  const statsRef = useRef([]);
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const modalCardRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  /* ── animated background lines ── */
  useEffect(() => {
    const lines = linesRef.current.filter(Boolean);
    if (!lines.length) return;

    const tls = lines.map((line, i) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      const dir = i % 2 === 0 ? 1 : -1;
      const speed = 5 + i * 1.4;
      tl.fromTo(
        line,
        { xPercent: dir * -20, opacity: 0 },
        { xPercent: dir * 20, opacity: 0.65, duration: speed, ease: "sine.inOut" }
      );
      tl.progress(i / lines.length);
      return tl;
    });

    return () => tls.forEach((tl) => tl.kill());
  }, []);

  /* ── stat cards animate in ── */
  useEffect(() => {
    const els = statsRef.current.filter(Boolean);
    if (!els.length || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(els, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });
    });
    return () => ctx.revert();
  }, []);

  /* ── 3D tilt hover on cards (optimized — RAF-throttled mousemove) ── */
  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    if (!cards.length) return;
    if (matchMedia("(hover: none)").matches) return;

    const handlers = cards.map((card, i) => {
      const accent = PROJECTS[i]?.accent || "#fff";

      const onEnter = () => {
        gsap.to(card, {
          scale: 1.025,
          boxShadow: `0 0 0 1px ${accent}44, 0 24px 64px -12px ${accent}30`,
          duration: 0.4,
          ease: "power2.out",
        });
        const title = card.querySelector(".project-card-title");
        if (title) gsap.to(title, { color: accent, duration: 0.3 });
        const sweep = card.querySelector(".pcard-sweep");
        if (sweep) gsap.to(sweep, { scaleX: 1, duration: 0.55, ease: "power3.out" });
      };

      const onLeave = () => {
        gsap.to(card, {
          scale: 1, rotateX: 0, rotateY: 0,
          boxShadow: "none", duration: 0.5, ease: "power3.out",
        });
        const title = card.querySelector(".project-card-title");
        if (title) gsap.to(title, { clearProps: "color", duration: 0.3 });
        const sweep = card.querySelector(".pcard-sweep");
        if (sweep) gsap.to(sweep, { scaleX: 0, duration: 0.4 });
      };

      // RAF-throttled spotlight — only one repaint per frame
      let rafId = 0;
      const onMove = (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100;
          const my = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--mx", `${mx}%`);
          card.style.setProperty("--my", `${my}%`);
          rafId = 0;
        });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove", onMove, { passive: true });
      return { card, onEnter, onLeave, onMove, rafId: () => rafId };
    });

    return () => {
      handlers.forEach(({ card, onEnter, onLeave, onMove, rafId }) => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(rafId());
      });
    };
  }, []);

  /* ── card click: open GitHub if available, else open modal ── */
  const handleCardClick = (project) => {
    if (project.href && project.href !== "#") {
      window.open(project.href, "_blank", "noopener,noreferrer");
    } else {
      setSelectedProject(project);
    }
  };

  const closeProject = () => {
    const overlay = modalOverlayRef.current;
    const card = modalCardRef.current;
    if (!overlay || !card) {
      setSelectedProject(null);
      return;
    }
    gsap.to(card, { y: 40, opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(overlay, {
      opacity: 0, duration: 0.3, delay: 0.1,
      onComplete: () => setSelectedProject(null),
    });
  };

  useEffect(() => {
    if (!selectedProject) return;
    const overlay = modalOverlayRef.current;
    const card = modalCardRef.current;
    if (!overlay || !card) return;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(card,
      { y: 60, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
    );

    const handleKey = (e) => { if (e.key === "Escape") closeProject(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedProject]);

  return (
    <>
      <section id="projects-section" className="projects-section" ref={sectionRef}>
        {/* ── animated bg lines (reduced for perf) ── */}
        <div className="projects-bg-lines" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`pbg-line pbg-line--${i * 2 + 1}`}
              ref={(el) => (linesRef.current[i] = el)}
            />
          ))}
        </div>

        <div className="projects-watermark" aria-hidden="true">WORK</div>

        {/* ── header row: title LEFT + stats RIGHT ── */}
        <div className="projects-header-row">
          <header className="projects-header">
            <p className="projects-eyebrow">SELECTED WORK — 2026</p>
            <h2 className="projects-title">
              <span className="title-line">Things I've</span>
              <span className="title-line">built & broken.</span>
            </h2>
            <p className="projects-intro">
              A mix of software, hardware, and web — some finished, some still
              very much in progress.
            </p>
            <span className="projects-header-line" />
          </header>

          {/* ── right panel ── */}
          <aside className="projects-stats-panel">
            <div className="pside-text">
              <p className="pside-eyebrow">APPROACH</p>
              <p className="pside-body">
                I don't build side projects just to fill a resume.
                Every thing here started because I had a genuine problem,
                a wild idea, or couldn't sleep until I figured something out.
                Hardware, AI, web — the domain doesn't matter.
                Shipping does.
              </p>
              <p className="pside-note">
                Open source when possible. Documented when I remember.
              </p>
              <a
                className="pside-github"
                href="https://github.com/Aariyan007"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={12} />
                See everything on GitHub
              </a>
            </div>

            <div className="pstats-block">
              <p className="pstats-label">BY THE NUMBERS</p>
              <div className="pstats-list">
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="pstat-row"
                    ref={(el) => (statsRef.current[i] = el)}
                  >
                    <span className="pstat-row-accent" />
                    <span className="pstat-row-value">{s.value}</span>
                    <div className="pstat-row-right">
                      <span className="pstat-row-label">{s.label}</span>
                      {s.tag && <span className="pstat-row-tag">{s.tag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ── cards — click opens modal ── */}
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <div
              key={p.index}
              className="project-card"
              data-index={p.index}
              style={{ "--accent": p.accent }}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(p)}
              onKeyDown={(e) => e.key === "Enter" && handleCardClick(p)}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <span className="pcard-sweep" />
              <span className="pcard-corner pcard-corner--tl" />
              <span className="pcard-corner pcard-corner--br" />

              <span className="project-card-index">{p.index}</span>

              <div className="project-card-body">
                <div className="project-card-top">
                  <h3 className="project-card-title">{p.title}</h3>
                  <span className="project-card-year">{p.year}</span>
                </div>
                <p className="project-card-subtitle">{p.subtitle}</p>
                <p className="project-card-desc">{p.description}</p>

                <div className="project-card-tags">
                  {p.tags.map((tag) => (
                    <span className="project-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="project-card-status">{p.status}</span>
              </div>

              <span className="project-card-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Project Detail Modal ── */}
      {selectedProject &&
        createPortal(
          <div
            className="project-modal-overlay"
            ref={modalOverlayRef}
            onClick={(e) => {
              if (e.target === modalOverlayRef.current) closeProject();
            }}
          >
            <div className="project-modal" ref={modalCardRef}>
              <button
                type="button"
                className="project-modal-close"
                onClick={closeProject}
                aria-label="Close project detail"
              >
                <X size={20} />
              </button>

              <div className="project-modal-accent" style={{ background: selectedProject.accent }} />

              <span className="project-modal-index">{selectedProject.index}</span>
              <h2 className="project-modal-title">{selectedProject.title}</h2>
              <p className="project-modal-subtitle">{selectedProject.subtitle}</p>

              <div className="project-modal-meta">
                <span>{selectedProject.year}</span>
                <span className="project-modal-status">{selectedProject.status}</span>
              </div>

              <p className="project-modal-desc">
                {selectedProject.longDescription || selectedProject.description}
              </p>

              <div className="project-modal-tags">
                {selectedProject.tags.map((tag) => (
                  <span className="project-modal-tag" key={tag}>{tag}</span>
                ))}
              </div>

              {selectedProject.href && selectedProject.href !== "#" && (
                <a
                  className="project-modal-link"
                  href={selectedProject.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={14} />
                  View on GitHub
                </a>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}