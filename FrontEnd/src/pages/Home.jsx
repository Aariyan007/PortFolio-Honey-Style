import { useCallback, useEffect, useRef, useState } from "react";
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
import CustomCursor from "../components/CustomCursor";
import ScrollProgress from "../components/ScrollProgress";
import MotionLayer from "../components/MotionLayer";
import NeuralCanvas from "../components/NeuralCanvas";
import Hud from "../components/Hud";
import DecodeText from "../components/DecodeText";

gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);

const MARQUEE_ITEMS = [
  "React", "Node.js", "MongoDB", "Express", "GSAP",
  "JavaScript", "TypeScript", "Next.js", "Tailwind CSS",
  "PostgreSQL", "Docker", "Git", "Figma", "REST APIs",
];

export default function Home() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const heroTlRef = useRef(null);
  const [loaderDone, setLoaderDone] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    let removeListeners = () => { };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });

      tl.from(".neural-canvas, .neural-fallback", { opacity: 0, duration: 1.6 })
        .from(".intro-text", { opacity: 0, y: -15, duration: 0.8 }, "-=1")
        .from(".headline-line", { y: 80, opacity: 0, duration: 1, stagger: 0.15 }, "-=0.6")
        .from(".hud", { opacity: 0, duration: 0.8 }, "-=0.4")
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
    });

    return () => {
      removeListeners();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!loaderDone) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let removeContactHoverListeners = () => { };
    let removeContactMagnetic = () => { };

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: reduced ? 0 : 1.0,
      effects: !reduced,
      smoothTouch: false,
    });

    const ctx = gsap.context(() => {
      gsap.from(".home-bottom-marquee", {
        scrollTrigger: { trigger: ".home-bottom-marquee", start: "top 95%", end: "top 60%", scrub: 1 },
        y: 60,
        opacity: 0,
      });

      const aboutWords = gsap.utils.toArray(".about-reveal-word");
      if (aboutWords.length) {
        gsap.set(aboutWords, { opacity: 0.1, y: 12 });
        gsap.to(aboutWords, {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: ".about-reveal-text", start: "top 80%", end: "bottom 60%", scrub: 0.5 },
        });
      }

      gsap.to(".about-content", {
        opacity: 0,
        y: -60,
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

      // Only animate first 3 shapes for perf (each gets its own scrub ScrollTrigger)
      gsap.utils.toArray(".about-shape").slice(0, 3).forEach((shape, i) => {
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

      gsap.timeline({ scrollTrigger: { trigger: ".projects-section", start: "top 75%" }, defaults: { ease: "power3.out" } })
        .from(".projects-eyebrow, .projects-title .title-line, .projects-intro", { y: 40, opacity: 0, duration: 0.9, stagger: 0.1 })
        .to(".projects-header-line", { scaleX: 1, duration: 0.9 }, 0);

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

      // Batch card entrance: single ScrollTrigger per card, no blur
      gsap.utils.toArray(".project-card").forEach((card) => {
        const line = card.querySelector(".project-card-line");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
        tl.from(card, { y: 60, opacity: 0, duration: 0.9, ease: "power3.out" })
          .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0);
      });



      // ── Smooth number counters for about stats ──
      gsap.utils.toArray(".about-stat-value").forEach((el) => {
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)(\+?)$/);
        if (!match) return; // skip non-numeric like "INDIA", "B.TECH"
        const target = parseInt(match[1], 10);
        const suffix = match[2] || "";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      });

      // ── contact section: one reveal timeline + watermark scrub ──
      gsap.timeline({ scrollTrigger: { trigger: ".contact-section", start: "top 75%" }, defaults: { ease: "power3.out" } })
        .to([".contact-rule--top", ".contact-rule--mid"], { scaleX: 1, duration: 1, stagger: 0.15 }, 0)
        .fromTo(".contact-glow", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }, 0)
        .from(".contact-eyebrow", { y: 24, opacity: 0, duration: 0.8 }, 0)
        .from(".contact-line", { y: 60, opacity: 0, duration: 1, stagger: 0.12 }, 0.2)
        .from(".contact-sub", { y: 30, opacity: 0, duration: 0.8 }, 0.5)
        .from(".contact-section .contact-email", { y: 30, opacity: 0, duration: 0.8 }, 0.6)
        .from(".contact-social-link", { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }, 0.75)
        .from(".contact-section .contact-footer", { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" }, 0.9);

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
      const isTouch = matchMedia("(hover: none)").matches;
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
          el.addEventListener("mousemove", move, { passive: true });
          el.addEventListener("mouseleave", leave);
          return () => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          };
        });
        removeContactMagnetic = () => magneticCleanups.forEach((fn) => fn());
      }

      const scrollCue = document.querySelector(".hero-meta-scroll");
      if (scrollCue) {
        scrollCue.style.cursor = "pointer";
        scrollCue.addEventListener("click", () => {
          smoother.scrollTo(".home-bottom-marquee", true, "top 80%");
        });
      }
    });

    return () => {
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
      {!loaderDone && <Loader onFinish={handleLoaderFinish} ready={sceneReady} />}
      <NeuralCanvas onReady={handleSceneReady} />
      <MotionLayer />
      <Hud />
      <Navbar />
      <CustomCursor />
      <ScrollProgress />

      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          <div className="home" id="hero">
            <div className="hero-overlay" />
            <div className="hero-vignette" />
            <div className="grain-overlay" />

            <DecodeText as="div" className="edge-label" text="FULL-STACK DEVELOPER" hover={false} />
            <div className="hero-meta">
              <span className="hero-meta-item"><span className="status-dot" /> AVAILABLE FOR WORK</span>
              <span className="hero-meta-item hero-meta-scroll">SCROLL ↓</span>
            </div>

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

          <section className="about-section" id="about">
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
                  <DecodeText as="p" className="about-label" text="ABOUT ME" />
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
                    ["600+", true], ["LeetCode", true], ["problems", true],
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
                  <span className="about-stat-value">75+</span>
                  <span className="about-stat-label">PROJECTS</span>
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