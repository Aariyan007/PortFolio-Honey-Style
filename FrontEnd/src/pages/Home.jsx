import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText"; // free now, no Club GSAP needed
import Navbar from "../components/Navbar";
import "./Home.css";

gsap.registerPlugin(SplitText);

export default function Home() {
  const videoRef = useRef(null);
  const videoWrapRef = useRef(null);

  useEffect(() => {
    let removeListeners = () => {};
    let removeMouseMove = () => {};

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(videoRef.current, { opacity: 0, duration: 1.6 })
        .from(".intro-text", { opacity: 0, y: -15, duration: 0.8 }, "-=1")
        .from(".headline-line", { y: 80, opacity: 0, filter: "blur(8px)", duration: 1, stagger: 0.15 }, "-=0.6")
        .from(".frame-corners .corner", { opacity: 0, scale: 0.5, duration: 0.6, stagger: 0.05 }, "-=0.4")
        .from([".edge-label", ".hero-meta"], { opacity: 0, duration: 0.8 }, "-=0.3");

      // hover ripple on headline lines
      const lines = gsap.utils.toArray(".headline-line");
      // const splits = lines.map((line) => new SplitText(line, { type: "words,chars" }));
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

      // cursor parallax on the video wrapper, not the video itself
      const quickX = gsap.quickTo(videoWrapRef.current, "x", { duration: 1.2, ease: "power3.out" });
      const quickY = gsap.quickTo(videoWrapRef.current, "y", { duration: 1.2, ease: "power3.out" });
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
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
      ctx.revert(); // also reverts SplitText spans back to plain text
    };
  }, []);

  return (
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
        <span className="hero-meta-item hero-meta-scroll">SCROLL</span>
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
    </div>
  );
}