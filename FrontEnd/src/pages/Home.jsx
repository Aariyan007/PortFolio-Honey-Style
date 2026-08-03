import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Navbar from "../components/Navbar";
import "./Home.css";
import Marquee from "../components/Marquee";
import Experience from "../components/Experience";

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

  useEffect(() => {
    let removeListeners = () => { };
    let removeMouseMove = () => { };

    // Create ScrollSmoother for buttery smooth scrolling
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(videoRef.current, { opacity: 0, duration: 1.6 })
        .from(".intro-text", { opacity: 0, y: -15, duration: 0.8 }, "-=1")
        .from(".headline-line", { y: 80, opacity: 0, filter: "blur(8px)", duration: 1, stagger: 0.15 }, "-=0.6")
        .from(".frame-corners .corner", { opacity: 0, scale: 0.5, duration: 0.6, stagger: 0.05 }, "-=0.4")
        .from([".edge-label", ".hero-meta"], { opacity: 0, duration: 0.8 }, "-=0.3");

      // hover ripple on headline lines
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

      // cursor parallax on the video wrapper
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

      // Animate the bottom marquee into view on scroll
      gsap.from(".home-bottom-marquee", {
        scrollTrigger: {
          trigger: ".home-bottom-marquee",
          start: "top 95%",
          end: "top 60%",
          scrub: 1,
        },
        y: 60,
        opacity: 0,
      });

      // ─── Background color transition on scroll ───
      gsap.to(".about-section", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
        backgroundColor: "#141418",
        ease: "none",
      });

      // ─── About section: word-by-word scroll reveal ───
      const aboutWords = gsap.utils.toArray(".about-reveal-word");
      if (aboutWords.length) {
        gsap.set(aboutWords, { opacity: 0.1, filter: "blur(4px)", y: 12 });
        gsap.to(aboutWords, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-reveal-text",
            start: "top 80%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        });
      }

      // ─── About section: fade out as user scrolls down to next section ───
      gsap.to(".about-content", {
        opacity: 0,
        y: -60,
        filter: "blur(10px)",
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "bottom 80%",
          end: "bottom 25%",
          scrub: true,
        },
      });

      // ─── Glowing horizontal lines — move + fade on scroll ───
      gsap.utils.toArray(".about-line").forEach((line, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          line,
          { xPercent: direction * -40, opacity: 0 },
          {
            xPercent: direction * 40,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-section",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // ─── Watermark text — slow parallax ───
      gsap.fromTo(".about-watermark", {
        yPercent: 20,
      }, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // ─── Floating shapes — rotate & drift ───
      gsap.utils.toArray(".about-shape").forEach((shape, i) => {
        gsap.fromTo(
          shape,
          {
            y: 60 + i * 20,
            rotation: -15 + i * 10,
            opacity: 0,
          },
          {
            y: -(40 + i * 15),
            rotation: 15 + i * 8,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-section",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // ─── Radial glow pulse ───
      gsap.fromTo(".about-glow", {
        scale: 0.6,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
          end: "center center",
          scrub: true,
        },
      });

      // ─── Stats panel — stagger in ───
      gsap.from(".about-stat", {
        scrollTrigger: {
          trigger: ".about-stats",
          start: "top 85%",
          end: "top 55%",
          scrub: 1,
        },
        y: 40,
        opacity: 0,
        stagger: 0.08,
      });

      // ─── Scroll progress bar ───
      gsap.to(".about-progress-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // About label slide in with line
      gsap.from(".about-label", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
          end: "top 55%",
          scrub: 1,
        },
        x: -60,
        opacity: 0,
      });

      gsap.from(".about-label-line", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%",
          end: "top 55%",
          scrub: 1,
        },
        scaleX: 0,
        transformOrigin: "left center",
      });

      // Scroll-cue: clicking SCROLL smoothly scrolls to the marquee
      const scrollCue = document.querySelector(".hero-meta-scroll");
      if (scrollCue) {
        scrollCue.style.cursor = "pointer";
        scrollCue.addEventListener("click", () => {
          smoother.scrollTo(".home-bottom-marquee", true, "top 80%");
        });
      }
    });

    return () => {
      removeListeners();
      removeMouseMove();
      smoother.kill();
      ctx.revert();
    };
  }, []);

  return (
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

          {/* Bottom marquee */}
          <div className="home-bottom-marquee">
            <Marquee items={MARQUEE_ITEMS} />
          </div>
        </div>

        {/* ─── About Me — scroll-reveal section ─── */}
        <section className="about-section">
          {/* Scroll progress bar */}
          <div className="about-progress" aria-hidden="true">
            <div className="about-progress-fill" />
          </div>

          {/* Large watermark text */}
          <div className="about-watermark" aria-hidden="true">AARIYAN</div>

          {/* Radial glow behind text */}
          <div className="about-glow" aria-hidden="true" />

          {/* Glowing decorative lines */}
          <div className="about-lines" aria-hidden="true">
            <span className="about-line about-line--1" />
            <span className="about-line about-line--2" />
            <span className="about-line about-line--3" />
            <span className="about-line about-line--4" />
            <span className="about-line about-line--5" />
          </div>

          {/* Floating geometric shapes */}
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
                {"Hi, I am ".split(" ").map((w, i) => <span key={`w1-${i}`} className="about-reveal-word">{w} </span>)}
                {["Aariyan."].map((w, i) => <span key={`a1-${i}`} className="about-reveal-word text-accent">{w} </span>)}
                {"I am 21 years old, currently pursuing my".split(" ").map((w, i) => <span key={`w2-${i}`} className="about-reveal-word">{w} </span>)}
                {["engineering", "degree."].map((w, i) => <span key={`a2-${i}`} className="about-reveal-word text-accent">{w} </span>)}
                {"I build things for the web —".split(" ").map((w, i) => <span key={`w3-${i}`} className="about-reveal-word">{w} </span>)}
                {["fast", "interfaces,"].map((w, i) => <span key={`a3-${i}`} className="about-reveal-word text-accent">{w} </span>)}
                {"clean backends, and everything in between. I love turning ideas into real, working products.".split(" ").map((w, i) => <span key={`w4-${i}`} className="about-reveal-word">{w} </span>)}
                {["Nice", "to", "meet", "you."].map((w, i) => <span key={`a4-${i}`} className="about-reveal-word text-accent">{w} </span>)}
              </p>
            </div>

            {/* Side stats */}
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

        {/* ─── Experience Section ─── */}
        <Experience />
      </div>
    </div>
  );
}