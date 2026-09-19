import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Projects.css";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    index: "01",
    title: "Jarvis",
    subtitle: "THEFriend — voice AI assistant",
    year: "2026",
    status: "Ongoing — flagship",
    description:
      "A voice-first assistant with wake-word detection, voice authentication, a ReAct agent for multi-step tasks, and mood-based speech synthesis. Built as a startup, not a side project.",
    tags: ["Python", "Whisper", "Gemini", "ElevenLabs", "ReAct Agent"],
    href: "https://github.com/Aariyan007/THEFriend",
    accent: "#6ee7f7",
  },
  {
    index: "02",
    title: "Gesture Home Switch",
    subtitle: "Gesture-Controlled Wireless Home Appliance Switch",
    year: "2026",
    status: "College IoT project",
    description:
      "A wrist-worn gesture sensor talks to a stationary receiver over ESP-NOW to switch appliances on and off, with a cloud dashboard layered on top.",
    tags: ["ESP32", "MPU6050", "ESP-NOW", "IoT"],
    href: "#",
    accent: "#a78bfa",
  },
  {
    index: "03",
    title: "Laser Balloon Turret",
    subtitle: "Autonomous targeting turret",
    year: "2026",
    status: "College IoT project",
    description:
      "A computer-vision-guided turret that finds balloons in frame and pops them with a laser diode — servo aiming, real-time detection, zero human input.",
    tags: ["Computer Vision", "Servo Control", "Embedded"],
    href: "#",
    accent: "#f472b6",
  },
  {
    index: "04",
    title: "Spiderman Mask AI",
    subtitle: "Wearable hobby build",
    year: "2026",
    status: "Personal project",
    description:
      "A physical Spiderman mask wired up with a mini voice assistant and proximity sensors for a spidey-sense-style motion alert, front and back.",
    tags: ["Embedded", "Voice Assistant", "Sensors"],
    href: "#",
    accent: "#fb923c",
  },
  {
    index: "05",
    title: "Mech Arc",
    subtitle: "Sponsor site for a racing team",
    year: "2026",
    status: "Web project",
    description:
      "A black-and-white site built for a car his team races competitively, with an Apple-style GSAP intro loader and a glassmorphism nav.",
    tags: ["React", "GSAP", "Vite"],
    href: "#",
    accent: "#4ade80",
  },
  {
    index: "06",
    title: "This Portfolio",
    subtitle: "You're looking at it",
    year: "2026",
    status: "Web project",
    description:
      "React, GSAP and ScrollSmoother, with a language-cycling loader that greets you in whatever time of day it is where you are.",
    tags: ["React", "GSAP", "ScrollSmoother"],
    href: "#",
    accent: "#facc15",
  },
];

const STATS = [
  { value: "6+",  label: "Projects Built",     tag: null },
  { value: "12+", label: "Open Source PRs",    tag: null },
  { value: "✓",   label: "Hacktoberfest 2025", tag: "COMPLETED" },
  { value: "3+",  label: "Years Coding",        tag: null },
];

export default function ProjectsSection() {
  const linesRef = useRef([]);
  const statsRef = useRef([]);
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);

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
        filter: "blur(8px)",
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

  /* ── 3D tilt hover on cards ── */
  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    if (!cards.length) return;

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
        if (title) gsap.to(title, { color: accent, duration: 0.3, ease: "power2.out" });

        const sweep = card.querySelector(".pcard-sweep");
        if (sweep) gsap.to(sweep, { scaleX: 1, duration: 0.55, ease: "power3.out" });

        const corners = card.querySelectorAll(".pcard-corner");
        gsap.to(corners, { width: 28, height: 28, borderColor: accent, opacity: 1, duration: 0.3 });
      };

      const onLeave = () => {
        gsap.to(card, {
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          boxShadow: "none",
          duration: 0.5,
          ease: "power3.out",
        });
        const title = card.querySelector(".project-card-title");
        if (title) gsap.to(title, { clearProps: "color", duration: 0.3, ease: "power2.in" });

        const sweep = card.querySelector(".pcard-sweep");
        if (sweep) gsap.to(sweep, { scaleX: 0, duration: 0.4, ease: "power3.in" });

        const corners = card.querySelectorAll(".pcard-corner");
        gsap.to(corners, {
          width: 14,
          height: 14,
          borderColor: "rgba(255,255,255,0.2)",
          opacity: 0.5,
          duration: 0.3,
        });
      };

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        gsap.to(card, {
          rotateY: dx * 9,
          rotateX: -dy * 7,
          duration: 0.25,
          ease: "power1.out",
          transformPerspective: 900,
        });

        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove", onMove);
      return { card, onEnter, onLeave, onMove };
    });

    return () => {
      handlers.forEach(({ card, onEnter, onLeave, onMove }) => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove", onMove);
      });
    };
  }, []);

  return (
    <section id="projects-section" className="projects-section" ref={sectionRef}>
      {/* ── animated bg lines ── */}
      <div className="projects-bg-lines" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`pbg-line pbg-line--${i + 1}`}
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
            <span className="title-line">built &amp; broken.</span>
          </h2>
          <p className="projects-intro">
            A mix of software, hardware, and web — some finished, some still
            very much in progress.
          </p>
          <span className="projects-header-line" />
        </header>

        {/* ── right panel ── */}
        <aside className="projects-stats-panel">

          {/* descriptor text */}
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
          </div>

          {/* stats */}
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

      {/* ── cards ── */}
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <a
            key={p.index}
            className="project-card"
            data-index={p.index}
            style={{ "--accent": p.accent }}
            href={p.href}
            target={p.href.startsWith("http") ? "_blank" : undefined}
            rel={p.href.startsWith("http") ? "noreferrer" : undefined}
            ref={(el) => (cardsRef.current[i] = el)}
          >
            {/* hover sweep bar */}
            <span className="pcard-sweep" />
            {/* corner brackets */}
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
          </a>
        ))}
      </div>
    </section>
  );
}