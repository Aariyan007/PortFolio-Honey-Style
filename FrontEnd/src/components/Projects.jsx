import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ExternalLink } from "lucide-react";
import DecodeText from "./DecodeText";
import ProjectArchive from "./ProjectArchive";
import { FEATURED, ARCHIVE, STATS, CATEGORY_LABEL } from "../data/projects";
import { emitHighlight } from "../three/events";
import "./Projects.css";

gsap.registerPlugin(ScrollTrigger);

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
      const accent = FEATURED[i]?.accent || "#fff";

      const onEnter = () => {
        emitHighlight(i);
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
        emitHighlight(null);
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

  /* ── card click: always open the modal (it carries the GitHub / Live buttons) ── */
  const handleCardClick = (project, i) => setSelectedProject({ ...project, index: String(i + 1).padStart(2, "0") });

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
            <DecodeText as="p" className="projects-eyebrow" text="SELECTED WORK — 2026" />
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
                data-magnetic
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
          {FEATURED.map((p, i) => (
            <div
              key={p.id}
              className="project-card"
              data-index={String(i + 1).padStart(2, "0")}
              style={{ "--accent": p.accent }}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(p, i)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), handleCardClick(p, i))}
              onFocus={() => emitHighlight(i)}
              onBlur={() => emitHighlight(null)}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <span className="pcard-sweep" />
              <span className="pcard-holo" aria-hidden="true" />
              <span className="pcard-corner pcard-corner--tl" />
              <span className="pcard-corner pcard-corner--br" />

              <span className="project-card-index">{String(i + 1).padStart(2, "0")}</span>

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

                <ul className="project-card-metrics">
                  {p.metrics.map((m) => <li className="project-card-metric" key={m}>{m}</li>)}
                </ul>

                <span className="project-card-status">{p.status}</span>
              </div>

              <span className="project-card-line" />
            </div>
          ))}
        </div>

        <ProjectArchive items={ARCHIVE} onOpen={setSelectedProject} />
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

              <div className="project-modal-accent" style={{ background: selectedProject.accent ?? "var(--color-accent)" }} />

              <span className="project-modal-index">{selectedProject.index ?? CATEGORY_LABEL[selectedProject.category]}</span>
              <h2 className="project-modal-title">{selectedProject.title}</h2>
              {selectedProject.subtitle && <p className="project-modal-subtitle">{selectedProject.subtitle}</p>}

              <div className="project-modal-meta">
                <span>{selectedProject.year}</span>
                {selectedProject.status && <span className="project-modal-status">{selectedProject.status}</span>}
              </div>

              <p className="project-modal-desc">
                {selectedProject.longDescription || selectedProject.description}
              </p>

              {selectedProject.tags?.length > 0 && (
                <div className="project-modal-tags">
                  {selectedProject.tags.map((tag) => (
                    <span className="project-modal-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              )}

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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}