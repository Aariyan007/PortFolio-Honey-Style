import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Navbar from "../components/Navbar";
import "./Home.css";
import Marquee from "../components/Marquee";
import Experience from "../components/Experience";
import ProjectsSection from "../components/Projects";
import Contact from "../components/Contact";
import Loader from "../components/Loader";

gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);

const MARQUEE_ITEMS = [
  "React", "Node.js", "MongoDB", "Express", "GSAP",
  "JavaScript", "TypeScript", "Next.js", "Tailwind CSS",
  "PostgreSQL", "Docker", "Git", "Figma", "REST APIs",
];

export default function Home() {
  const videoRef = useRef(null);
  const videoWrapRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const heroTlRef = useRef(null);
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    let removeListeners = () => { };
    let removeMouseMove = () => { };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });

      tl.from(videoRef.current, { opacity: 0, duration: 1.6 })
        .from(".intro-text", { opacity: 0, y: -15, duration: 0.8 }, "-=1")
        .from(".headline-line", { y: 80, opacity: 0, filter: "blur(8px)", duration: 1, stagger: 0.15 }, "-=0.6")
        .from(".frame-corners .corner", { opacity: 0, scale: 0.5, duration: 0.6, stagger: 0.05 }, "-=0.4")
        .from([".edge-label", ".hero-meta"], { opacity: 0, duration: 0.8 }, "-=0.3");

      heroTlRef.current = tl;

      const lines = gsap.utils.toArray(".headline-line");
      const splits = lines.map((line) => new SplitText(line, { type: "words, chars" }));
      const enterHandlers = splits.map((split) => () => {
        gsap.to(split.chars, {
          y: -10,
          duration: 0.4,
          stagger: { each: 0.02, from: "start" },
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
      });
      lines.forEach((line, i) => line.addEventListener("mouseenter", enterHandlers[i]));
      removeListeners = () =>
        lines.forEach((line, i) => line.removeEventListener("mouseenter", enterHandlers[i]));

      const quickX = gsap.quickTo(videoWrapRef.current, "x", { duration: 1.2, ease: "power3.out" });
      const quickY = gsap.quickTo(videoWrapRef.current, "y", { duration: 1.2, ease: "power3.out" });
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        quickX(x * 20);
        quickY(y * 12);
      };
      window.addEventListener("mousemove", handleMouseMove);
      removeMouseMove = () => window.removeEventListener("mousemove", handleMouseMove);
    });

    return () => {
      removeListeners();
      removeMouseMove();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!loaderDone) return;

    let removeProjectsCursorMove = () => { };
    let removeProjectsCardHandlers = () => { };
    let removeContactHoverListeners = () => { };
    let removeContactMagnetic = () => { };

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
    });

    const ctx = gsap.context(() => {
      gsap.from(".home-bottom-marquee", {
        scrollTrigger: { trigger: ".home-bottom-marquee", start: "top 95%", end: "top 60%", scrub: 1 },
        y: 60,
        opacity: 0,
      });

      gsap.to(".about-section", {
        scrollTrigger: { trigger: ".about-section", start: "top 85%", end: "top 25%", scrub: true },
        backgroundColor: "#141418",
        ease: "none",
      });

      const aboutWords = gsap.utils.toArray(".about-reveal-word");
      if (aboutWords.length) {
        gsap.set(aboutWords, { opacity: 0.1, filter: "blur(4px)", y: 12 });
        gsap.to(aboutWords, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: ".about-reveal-text", start: "top 80%", end: "bottom 60%", scrub: 0.5 },
        });
      }

      gsap.to(".about-content", {
        opacity: 0,
        y: -60,
        filter: "blur(10px)",
        ease: "none",
        scrollTrigger: { trigger: ".about-section", start: "bottom 80%", end: "bottom 25%", scrub: true },
      });

      gsap.utils.toArray(".about-line").forEach((line, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          line,
          { xPercent: direction * -40, opacity: 0 },
          {
            xPercent: direction * 40,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: ".about-section", start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      gsap.fromTo(
        ".about-watermark",
        { yPercent: 20 },
        {
          yPercent: -20,
          ease: "none",
          scrollTrigger: { trigger: ".about-section", start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      gsap.utils.toArray(".about-shape").forEach((shape, i) => {
        gsap.fromTo(
          shape,
          { y: 60 + i * 20, rotation: -15 + i * 10, opacity: 0 },
          {
            y: -(40 + i * 15),
            rotation: 15 + i * 8,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: ".about-section", start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      gsap.fromTo(
        ".about-glow",
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: ".about-section", start: "top 80%", end: "center center", scrub: true },
        }
      );

      gsap.from(".about-stat", {
        scrollTrigger: { trigger: ".about-stats", start: "top 85%", end: "top 55%", scrub: 1 },
        y: 40,
        opacity: 0,
        stagger: 0.08,
      });

      gsap.to(".about-progress-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: ".about-section", start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.from(".about-label", {
        scrollTrigger: { trigger: ".about-section", start: "top 80%", end: "top 55%", scrub: 1 },
        x: -60,
        opacity: 0,
      });

      gsap.from(".about-label-line", {
        scrollTrigger: { trigger: ".about-section", start: "top 80%", end: "top 55%", scrub: 1 },
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.from(".projects-eyebrow, .projects-title .title-line, .projects-intro", {
        y: 40,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".projects-section", start: "top 75%" },
      });

      gsap.to(".projects-header-line", {
        scaleX: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".projects-section", start: "top 75%" },
      });

      gsap.fromTo(
        ".projects-watermark",
        { yPercent: 15, opacity: 0.5 },
        {
          yPercent: -15,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: ".projects-section", start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      gsap.utils.toArray(".project-card").forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });

        const line = card.querySelector(".project-card-line");
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });

      const isTouch = matchMedia("(hover: none)").matches;
      if (!isTouch) {
        const cursor = document.querySelector(".projects-cursor");
        if (cursor) {
          gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 });

          const quickX = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3" });
          const quickY = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3" });

          const moveHandler = (e) => {
            quickX(e.clientX);
            quickY(e.clientY);
          };
          window.addEventListener("mousemove", moveHandler);
          removeProjectsCursorMove = () => window.removeEventListener("mousemove", moveHandler);

          const bound = gsap.utils.toArray(".project-card").map((card) => {
            const enter = () =>
              gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
            const leave = () =>
              gsap.to(cursor, { opacity: 0, scale: 0.6, duration: 0.3, ease: "power2.in" });
            const move = (e) => {
              const rect = card.getBoundingClientRect();
              card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
              card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
            };
            card.addEventListener("mouseenter", enter);
            card.addEventListener("mouseleave", leave);
            card.addEventListener("mousemove", move);
            return { card, enter, leave, move };
          });
          removeProjectsCardHandlers = () =>
            bound.forEach(({ card, enter, leave, move }) => {
              card.removeEventListener("mouseenter", enter);
              card.removeEventListener("mouseleave", leave);
              card.removeEventListener("mousemove", move);
            });
        }
      }

      // ── whole-page dark → white world transition ──
      gsap.fromTo(
        document.body,
        { backgroundColor: "#141418" },
        {
          backgroundColor: "#f0ede8",
          ease: "none",
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top 80%",
            end: "top -10%",
            scrub: 0.8,
          },
        }
      );

      gsap.fromTo(
        "#smooth-wrapper",
        { backgroundColor: "#141418" },
        {
          backgroundColor: "#f0ede8",
          ease: "none",
          scrollTrigger: {
            trigger: ".contact-section",
            start: "top 80%",
            end: "top -10%",
            scrub: 0.8,
          },
        }
      );

      // ── contact section extras: watermark, glow, rule draw-in ──
      gsap.to([".contact-rule--top", ".contact-rule--mid"], {
        scaleX: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ".contact-section", start: "top 85%" },
      });

      gsap.fromTo(
        ".contact-watermark",
        { yPercent: 20, opacity: 0 },
        {
          yPercent: -20,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: ".contact-section", start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      gsap.fromTo(
        ".contact-glow",
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: ".contact-section", start: "top 70%" },
        }
      );

      // headline hover ripple — same pattern as the hero headline
      const contactLines = gsap.utils.toArray(".contact-line");
      const contactSplits = contactLines.map((line) => new SplitText(line, { type: "words, chars" }));
      const contactEnterHandlers = contactSplits.map((split) => () => {
        gsap.to(split.chars, {
          y: -8,
          duration: 0.4,
          stagger: { each: 0.02, from: "start" },
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
      });
      contactLines.forEach((line, i) => line.addEventListener("mouseenter", contactEnterHandlers[i]));
      removeContactHoverListeners = () =>
        contactLines.forEach((line, i) => line.removeEventListener("mouseenter", contactEnterHandlers[i]));

      // magnetic arrows on the email link and social links — desktop/mouse only
      if (!isTouch) {
        const magneticEls = gsap.utils.toArray(".contact-email, .contact-social-link");
        const magneticCleanups = magneticEls.map((el) => {
          const arrow = el.querySelector(".contact-email-arrow, .contact-social-arrow");
          if (!arrow) return () => { };
          const quickX = gsap.quickTo(arrow, "x", { duration: 0.3, ease: "power3" });
          const quickY = gsap.quickTo(arrow, "y", { duration: 0.3, ease: "power3" });
          const move = (e) => {
            const rect = el.getBoundingClientRect();
            quickX((e.clientX - (rect.left + rect.width / 2)) * 0.25);
            quickY((e.clientY - (rect.top + rect.height / 2)) * 0.25);
          };
          const leave = () => {
            quickX(0);
            quickY(0);
          };
          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          return () => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          };
        });
        removeContactMagnetic = () => magneticCleanups.forEach((fn) => fn());
      }

      // contact section reveal animations
      gsap.from(".contact-eyebrow", {
        y: 24, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-section", start: "top 75%" },
      });

      gsap.from(".contact-line", {
        y: 60, opacity: 0, filter: "blur(6px)",
        duration: 1, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-headline", start: "top 82%" },
      });

      gsap.from(".contact-sub", {
        y: 30, opacity: 0,
        duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-headline", start: "top 72%" },
      });

      gsap.from(".contact-email", {
        y: 30, opacity: 0,
        duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-email", start: "top 88%" },
      });

      gsap.from(".contact-social-link", {
        y: 20, opacity: 0, stagger: 0.08,
        duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-socials", start: "top 90%" },
      });

      gsap.from(".contact-footer", {
        opacity: 0, y: 16,
        duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-footer", start: "top 98%" },
      });

      const scrollCue = document.querySelector(".hero-meta-scroll");
      if (scrollCue) {
        scrollCue.style.cursor = "pointer";
        scrollCue.addEventListener("click", () => {
          smoother.scrollTo(".home-bottom-marquee", true, "top 80%");
        });
      }
    });

    return () => {
      removeProjectsCursorMove();
      removeProjectsCardHandlers();
      removeContactHoverListeners();
      removeContactMagnetic();
      smoother.kill();
      ctx.revert();
    };
  }, [loaderDone]);

  const handleLoaderFinish = () => {
    setLoaderDone(true);
    heroTlRef.current?.play();
  };

  return (
    <>
      {!loaderDone && <Loader onFinish={handleLoaderFinish} />}
      <div className="projects-cursor" aria-hidden="true">VIEW</div>

      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          <div className="home">
            <div className="hero-video-wrap" ref={videoWrapRef}>
              <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline>
                <source src="/hero.webm" type="video/webm" />
                <source src="/hero.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="hero-overlay" />
            <div className="hero-vignette" />
            <div className="grain-overlay" />

            <div className="frame-corners">
              <span className="corner corner-tl" />
              <span className="corner corner-tr" />
              <span className="corner corner-bl" />
              <span className="corner corner-br" />
            </div>
            <div className="edge-label">FULL-STACK DEVELOPER</div>
            <div className="hero-meta">
              <span className="hero-meta-item"><span className="status-dot" /> AVAILABLE FOR WORK</span>
              <span className="hero-meta-item hero-meta-scroll">SCROLL ↓</span>
            </div>

            <Navbar />

            <main className="hero">
              <p className="intro-text">
                Full-stack developer based in India — building fast, functional,
                and thoughtful digital products.
              </p>

              <h1 className="headline">
                <span className="headline-line">In my mind, I'm always the best.</span>
                <span className="headline-line">I don't care what people think or say. Not just this year, but always</span>
              </h1>
            </main>

            <div className="home-bottom-marquee">
              <Marquee items={MARQUEE_ITEMS} />
            </div>
          </div>

          <section className="about-section">
            <div className="about-progress" aria-hidden="true">
              <div className="about-progress-fill" />
            </div>

            <div className="about-watermark" aria-hidden="true">AARIYAN</div>

            <div className="about-glow" aria-hidden="true" />

            <div className="about-lines" aria-hidden="true">
              <span className="about-line about-line--1" />
              <span className="about-line about-line--2" />
              <span className="about-line about-line--3" />
              <span className="about-line about-line--4" />
              <span className="about-line about-line--5" />
            </div>

            <div className="about-shapes" aria-hidden="true">
              <span className="about-shape about-shape--ring" />
              <span className="about-shape about-shape--cross" />
              <span className="about-shape about-shape--dot" />
              <span className="about-shape about-shape--square" />
              <span className="about-shape about-shape--diamond" />
            </div>

            <div className="about-content">
              <div className="about-inner">
                <div className="about-label-row">
                  <p className="about-label">ABOUT ME</p>
                  <span className="about-label-line" />
                </div>
                <p className="about-reveal-text">
                  {[
                    ["Hi,", false], ["I", false], ["am", false], ["Aariyan.", true],
                    ["I", false], ["am", false], ["a", false], ["Computer", false], ["Science", false], ["engineer", false], ["who", false], ["builds", false],
                    ["full-stack", true], ["systems,", true], ["AI", true], ["agents,", true], ["and", true], ["real-time", true], ["applications.", true],
                    ["I", false], ["enjoy", false], ["working", false], ["across", false], ["the", false], ["stack,", false], ["from", false],
                    ["React,", true], ["Node.js,", true], ["and", true], ["JavaScript", true],
                    ["to", false],
                    ["Python,", true], ["FastAPI,", true], ["TensorFlow,", true], ["and", true], ["machine", true], ["learning.", true],
                    ["I", false], ["also", false], ["like", false], ["breaking", false], ["down", false], ["hard", false], ["problems.", false],
                    ["A lot of", true], ["LeetCode", true], ["problems", true],
                    ["solved.", false], ["Always", false], ["curious", false], ["about", false], ["what", false], ["happens", false], ["under", false], ["the", false], ["hood.", false],
                  ].map(([word, accent], i) => (
                    <span
                      key={`about-word-${i}`}
                      className={`about-reveal-word${accent ? " text-accent" : ""}`}
                    >
                      {word}{" "}
                    </span>
                  ))}
                </p>
              </div>

              <aside className="about-stats">
                <div className="about-stat">
                  <span className="about-stat-value">21</span>
                  <span className="about-stat-label">AGE</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-value">INDIA</span>
                  <span className="about-stat-label">LOCATION</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-value">B.TECH</span>
                  <span className="about-stat-label">DEGREE</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-value">3+</span>
                  <span className="about-stat-label">YEARS CODING</span>
                </div>
              </aside>
            </div>
          </section>

          <Experience />
          <ProjectsSection />

          <Contact />
        </div>
      </div>
    </>
  );
}