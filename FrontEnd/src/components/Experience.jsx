import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Calendar, MapPin, ExternalLink, Code2, Sparkles } from "lucide-react";
import "./Experience.css";

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCES = [
  {
    id: "exp-1",
    role: "Software Engineer Intern",
    company: "Wipro",
    location: "India",
    period: "May 2026 — August 2026",
    type: "Internship",
    description:
      "Worked on enterprise software solutions across Angular, .NET, Azure AD, Fortanix DSM, and IIS, building secure onboarding systems, middleware integrations, and dynamic deployment workflows.",
    skills: [
      "Angular 17",
      ".NET 8",
      "Azure AD",
      "Fortanix DSM",
      "JWT",
      "AES",
      "IIS"
    ],
    highlights: [
      "Developed an embeddable onboarding widget using Angular 17 and .NET 8 for integration across host applications",
      "Built a relevance-scored documentation and FAQ search system with Azure AD JWT authentication and role-based access",
      "Engineered Fortanix DSM middleware and migrated static API keys to Azure Managed Identity for improved enterprise security",
      "Implemented dynamic runtime configuration on IIS, enabling environment-specific updates without frontend rebuilds"
    ],
  },
  {
    id: "exp-2",
    role: "Lead Web Developer",
    company: "Google Developer Groups On Campus - MITS",
    location: "Kochi, Kerala, India",
    period: "Oct 2025 — Present",
    type: "Club",
    description:
      "Leading technical initiatives and coordinating developer-focused events at MITS, managing teams and ensuring smooth execution of technical activities across the campus.",
    skills: [
      "Technical Leadership",
      "Event Management",
      "Team Coordination",
      "Web Development",
      "MERN Stack"
    ],
    highlights: [
      "Planned, coordinated, and managed technical events and developer activities conducted for the college community",
      "Led student teams in organizing workshops, competitions, and hands-on technical sessions",
      "Coordinated speakers, volunteers, logistics, and technical requirements to ensure smooth event execution",
      "Collaborated with the organizing team to develop and execute new technical initiatives for students"
    ],
  },
  {
    id: "exp-3",
    role: "Technical Lead",
    company: "Google Developer Groups On Campus - MITS",
    location: "Kochi, Kerala, India",
    period: "Jan 2025 — Oct 2025",
    type: "Club",
    description:
      "Managed technical activities and supported the planning and execution of developer events and initiatives for the MITS student community.",
    skills: [
      "Technical Leadership",
      "Event Coordination",
      "Team Management",
      "Project Management"
    ],
    highlights: [
      "Coordinated technical events and activities for students across the college",
      "Managed volunteers and organizing teams during event planning and execution",
      "Handled technical planning and on-ground coordination for developer-focused programs",
      "Worked with team members to deliver engaging technical sessions and student activities"
    ],
  },
];

const DECOR_LINE_COUNT = 6;

export default function Experience() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const threadSvgRef = useRef(null);
  const threadBgPathRef = useRef(null);
  const threadFillPathRef = useRef(null);
  const decorSvgRef = useRef(null);

  useEffect(() => {
    let ro = null;

    const ctx = gsap.context(() => {
      let threadTween = null;
      let decorTweens = [];

      // ─── Single deterministic connecting thread ───
      const buildThreadPath = (w, h) => {
        const svg = threadSvgRef.current;
        const bgPath = threadBgPathRef.current;
        const fillPath = threadFillPathRef.current;
        const timelineEl = timelineRef.current;
        if (!svg || !bgPath || !fillPath || !timelineEl) return;

        const isMobile = window.innerWidth <= 900;
        const centerX = isMobile ? 20 : w / 2;
        const amplitude = isMobile ? 0 : Math.min(14, w * 0.015);
        const wavelength = 420;
        const step = 16;

        let d = "";
        for (let y = 0; y <= h; y += step) {
          const x = centerX + amplitude * Math.sin((y / wavelength) * Math.PI * 2);
          d += y === 0 ? `M ${x.toFixed(2)} 0` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
        const lastX = centerX + amplitude * Math.sin((h / wavelength) * Math.PI * 2);
        d += ` L ${lastX.toFixed(2)} ${h.toFixed(2)}`;

        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("preserveAspectRatio", "none");
        bgPath.setAttribute("d", d);
        fillPath.setAttribute("d", d);

        if (threadTween) {
          threadTween.scrollTrigger?.kill();
          threadTween.kill();
        }

        const total = fillPath.getTotalLength();
        if (!total) return;
        gsap.set(fillPath, { strokeDasharray: total, strokeDashoffset: total });

        threadTween = gsap.to(fillPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: timelineEl,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      };

      // ─── Random decorative background threads — spread across fixed ───
      // ─── width "slices" so they can never all land in one corner ───
      const buildDecorLines = (w, h) => {
        const svg = decorSvgRef.current;
        const timelineEl = timelineRef.current;
        if (!svg || !timelineEl) return;

        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("preserveAspectRatio", "none");

        decorTweens.forEach((t) => t.scrollTrigger?.kill());
        decorTweens.forEach((t) => t.kill());
        decorTweens = [];

        const paths = svg.querySelectorAll(".exp-decor-path");
        const sliceW = w / paths.length;

        paths.forEach((pathEl, i) => {
          // each line gets its own horizontal slice + jitter within it,
          // instead of pure random X across the whole width
          const startX = sliceW * i + sliceW * (0.2 + Math.random() * 0.6);
          const amplitude = 20 + Math.random() * 50;
          const wavelength = 180 + Math.random() * 260;
          const phase = Math.random() * Math.PI * 2;
          const startY = h * (Math.random() * 0.3);
          const spanY = h * (0.5 + Math.random() * 0.6);
          const endY = Math.min(h, startY + spanY);
          const step = 24;

          let d = "";
          for (let y = startY; y <= endY; y += step) {
            const local = y - startY;
            const x = startX + amplitude * Math.sin((local / wavelength) * Math.PI * 2 + phase);
            d += y === startY ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          }
          if (!d) return;
          pathEl.setAttribute("d", d);

          const isAccent = i % 3 === 0;
          pathEl.style.stroke = isAccent ? "var(--color-accent)" : "rgba(255,255,255,0.6)";
          pathEl.style.opacity = String((isAccent ? 0.09 : 0.06) + Math.random() * 0.05);
          pathEl.style.strokeWidth = `${1 + Math.random()}px`;

          const drift = 28 + i * 10;
          gsap.set(pathEl, { y: -drift });
          const tween = gsap.to(pathEl, {
            y: drift,
            ease: "none",
            scrollTrigger: {
              trigger: timelineEl,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8 + i * 0.15,
            },
          });
          decorTweens.push(tween);
        });
      };

      const buildAll = () => {
        const timelineEl = timelineRef.current;
        if (!timelineEl) return;
        const rect = timelineEl.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        // container hasn't actually laid out yet — skip, ResizeObserver
        // will fire again once it has real dimensions
        if (w < 50 || h < 50) return;

        buildThreadPath(w, h);
        buildDecorLines(w, h);
        ScrollTrigger.refresh();
      };

      // ResizeObserver fires whenever the container's real size settles —
      // covers late font loads, image loads, ScrollSmoother reflows,
      // orientation changes — far more reliable than a load/rAF guess.
      if (timelineRef.current) {
        let debounce;
        ro = new ResizeObserver(() => {
          clearTimeout(debounce);
          debounce = setTimeout(buildAll, 120);
        });
        ro.observe(timelineRef.current);
      }

      // also build immediately in case layout is already stable
      buildAll();

      // ─── Section Header animation ───
      gsap.from(".exp-header-label", {
        scrollTrigger: {
          trigger: ".experience-section",
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
        x: -40,
        opacity: 0,
      });

      gsap.from(".exp-header-title", {
        scrollTrigger: {
          trigger: ".experience-section",
          start: "top 75%",
          end: "top 45%",
          scrub: 1,
        },
        y: 40,
        opacity: 0,
        filter: "blur(6px)",
      });

      // ─── Experience Cards animation ───
      const cards = gsap.utils.toArray(".exp-card");
      cards.forEach((card, index) => {
        const isEven = index % 2 === 0;
        gsap.fromTo(
          card,
          {
            x: isEven ? -60 : 60,
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 55%",
              scrub: 1,
            },
          }
        );
      });

      // ─── Timeline Nodes pulse glow on trigger ───
      gsap.utils.toArray(".exp-node").forEach((node) => {
        gsap.fromTo(
          node,
          { scale: 0.6, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            scrollTrigger: {
              trigger: node,
              start: "top 80%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      });

      // ─── Background Watermark Parallax ───
      gsap.fromTo(
        ".exp-watermark",
        { yPercent: 20 },
        {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: ".experience-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => {
      if (ro) ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="experience-section" id="experience" ref={sectionRef}>
      {/* Background Watermark */}
      <div className="exp-watermark" aria-hidden="true">
        WORK & HISTORY
      </div>

      {/* Glow Effects */}
      <div className="exp-glow exp-glow--1" aria-hidden="true" />
      <div className="exp-glow exp-glow--2" aria-hidden="true" />

      <div className="exp-container">
        {/* Section Header */}
        <header className="exp-header">
          <div className="exp-header-label">
            <Sparkles size={14} className="exp-icon-sparkle" />
            <span>CAREER PATH</span>
          </div>
          <h2 className="exp-header-title">Experience & Journey</h2>
          <p className="exp-header-sub">
            Building software solutions, acquiring industry skills, and solving technical challenges.
          </p>
        </header>

        {/* Timeline Wrapper */}
        <div className="experience-timeline" ref={timelineRef}>
          {/* Random decorative background threads — pure filler, z-index 0 */}
          <svg className="exp-decor-svg" ref={decorSvgRef} aria-hidden="true">
            {Array.from({ length: DECOR_LINE_COUNT }).map((_, i) => (
              <path key={i} className="exp-decor-path" />
            ))}
          </svg>

          {/* The single connecting thread — always behind cards (z-index: 1) */}
          <svg className="exp-timeline-thread" ref={threadSvgRef} aria-hidden="true">
            <path className="exp-timeline-thread-bg" ref={threadBgPathRef} />
            <path className="exp-timeline-thread-fill" ref={threadFillPathRef} />
          </svg>

          {/* Experience Items */}
          <div className="exp-cards-list">
            {EXPERIENCES.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={item.id}
                  className={`exp-timeline-row ${isEven ? "exp-row--left" : "exp-row--right"}`}
                >
                  {/* Timeline Dot Node */}
                  <div className="exp-node">
                    <div className="exp-node-inner" />
                    <div className="exp-node-pulse" />
                  </div>

                  {/* Experience Card */}
                  <article className="exp-card">
                    <div className="exp-card-glow" />

                    <div className="exp-card-header">
                      <div className="exp-role-wrap">
                        <span className="exp-type-badge">{item.type}</span>
                        <h3 className="exp-role">{item.role}</h3>
                        <p className="exp-company">
                          <Briefcase size={14} />
                          <span>{item.company}</span>
                        </p>
                      </div>

                      <div className="exp-meta">
                        <span className="exp-meta-item">
                          <Calendar size={13} />
                          {item.period}
                        </span>
                        <span className="exp-meta-item">
                          <MapPin size={13} />
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <p className="exp-description">{item.description}</p>

                    {/* Highlights Bullet Points */}
                    <ul className="exp-highlights">
                      {item.highlights.map((point, pIdx) => (
                        <li key={pIdx} className="exp-highlight-item">
                          <span className="exp-bullet" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Badges */}
                    <div className="exp-skills">
                      {item.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="exp-skill-tag">
                          <Code2 size={11} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}