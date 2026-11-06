import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parseStat, formatStat } from "../lib/countUp.js";
import { SECTION_IDS } from "../data/sections.js";
import "./MotionLayer.css";

gsap.registerPlugin(ScrollTrigger);

// Site-wide extras: stat count-up, in-card staggers, card spotlight, and a HUD scan line on section entry.
export default function MotionLayer() {
  const lineRef = useRef(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups = [];

    const ctx = gsap.context(() => {
      // numbers count up the first time they scroll into view
      document.querySelectorAll(".pstat-row-value").forEach((el) => {
        el.dataset.stat ??= el.textContent.trim(); // survives StrictMode re-runs that already wrote "0"
        const stat = parseStat(el.dataset.stat);
        if (!stat) return;
        el.setAttribute("aria-label", el.dataset.stat);
        const o = { n: 0 };
        el.textContent = formatStat(stat, 0);
        gsap.to(o, {
          n: stat.value,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => (el.textContent = formatStat(stat, o.n)),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // bullets and tags settle in one after another once a card is in view
      gsap.utils.toArray(".exp-card").forEach((card) => {
        const items = card.querySelectorAll(".exp-highlight-item, .exp-skill-tag");
        if (!items.length) return;
        // explicit hide + play on enter: a scroll-bound from() can be re-rendered to its start by a refresh
        gsap.set(items, { opacity: 0, y: 14 });
        ScrollTrigger.create({
          trigger: card,
          start: "top 72%",
          once: true,
          onEnter: () =>
            gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power2.out", clearProps: "opacity,transform" }),
        });
      });

      // a thin amber scan line sweeps the screen as each section arrives
      const line = lineRef.current;
      const sweep = () =>
        gsap.fromTo(line, { y: -40, opacity: 1 }, { y: window.innerHeight + 40, opacity: 0.2, duration: 1.8, ease: "power2.inOut", overwrite: true });
      SECTION_IDS.slice(1).forEach((id) => {
        const el = document.getElementById(id);
        if (el) ScrollTrigger.create({ trigger: el, start: "top 55%", onEnter: sweep, onEnterBack: sweep });
      });
    });

    // cursor spotlight on experience cards (project cards and archive rows have their own hover) (pointer devices only)
    if (!matchMedia("(hover: none)").matches) {
      const onMove = (e) => {
        const card = e.target.closest?.(".exp-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onMove));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return <div ref={lineRef} className="scan-sweep" aria-hidden="true" />;
}
