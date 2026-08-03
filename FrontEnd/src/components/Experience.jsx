import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Calendar, MapPin, ExternalLink, Code2, Sparkles } from "lucide-react";
import "./Experience.css";

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCES = [
  {
    id: "exp-1",
    role: "Full-Stack Web Developer",
    company: "Freelance & Independent Projects",
    location: "India",
    period: "2024 — Present",
    type: "Remote / Contract",
    description:
      "Designing and architecting modern, high-performance web applications. Specialized in crafting bespoke UI animations, robust RESTful APIs, and responsive web platforms with ultra-smooth user experiences.",
    skills: ["React", "Node.js", "Express", "MongoDB", "GSAP", "Tailwind CSS"],
    highlights: [
      "Built custom web solutions for clients with focus on fast page speed & SEO",
      "Implemented complex GSAP scroll animations & interactive web experiences",
      "Engineered full-stack applications with clean MVC backend architecture",
    ],
  },
  {
    id: "exp-2",
    role: "Full-Stack Development Intern",
    company: "Tech Innovation Labs",
    location: "India",
    period: "2024",
    type: "Internship",
    description:
      "Collaborated with cross-functional teams to build and optimize full-stack web modules, database schemas, and interactive front-end dashboards.",
    skills: ["React", "JavaScript (ES6+)", "Node.js", "PostgreSQL", "Git", "REST APIs"],
    highlights: [
      "Optimized front-end rendering performance reducing load times by 35%",
      "Developed reusable React component libraries following modular design systems",
      "Participated in daily agile standups, code reviews, and API documentation",
    ],
  },
  {
    id: "exp-3",
    role: "Engineering Scholar & Developer",
    company: "B.Tech Engineering Program",
    location: "India",
    period: "2022 — Present",
    type: "Education & Projects",
    description:
      "Currently pursuing B.Tech Degree in Computer Science / Engineering. Hands-on experience building software architecture, algorithms, data structures, and capstone full-stack systems.",
    skills: ["Data Structures", "Algorithms", "System Design", "Web Tech", "Database Management"],
    highlights: [
      "Maintained top academic standing while leading engineering team projects",
      "Created multiple full-stack capstone projects with real-time features",
      "Active mentor in campus coding clubs & hackathons",
    ],
  },
];

export default function Experience() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ─── Timeline central vertical line fill on scroll ───
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".experience-timeline",
              start: "top 70%",
              end: "bottom 60%",
              scrub: true,
            },
          }
        );
      }

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

    return () => ctx.revert();
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
        <div className="experience-timeline">
          {/* Vertical Progress Line */}
          <div className="exp-timeline-line-bg" aria-hidden="true" />
          <div className="exp-timeline-line-fill" ref={lineRef} aria-hidden="true" />

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
