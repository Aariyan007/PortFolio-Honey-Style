import "./Projects.css";

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
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects-section" className="projects-section">
      {/* ambient background */}
      <div className="projects-watermark" aria-hidden="true">WORK</div>
      <div className="projects-glow-lines" aria-hidden="true">
        <span className="projects-glow-line projects-glow-line--1" />
        <span className="projects-glow-line projects-glow-line--2" />
      </div>

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

      <div className="projects-grid">
        {PROJECTS.map((p) => (
          <a
            key={p.index}
            className="project-card"
            data-index={p.index}
            href={p.href}
            target={p.href.startsWith("http") ? "_blank" : undefined}
            rel={p.href.startsWith("http") ? "noreferrer" : undefined}
          >
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