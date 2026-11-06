import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const CHARS = "!<>-_\\/[]{}=+*^?#01";

export default function DecodeText({ as = "span", text, className, hover = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const run = (duration) =>
      gsap.to(el, {
        duration,
        ease: "none",
        overwrite: true,
        scrambleText: { text, chars: CHARS, speed: 0.6, revealDelay: 0.1 },
      });

    const st = ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => run(1) });
    const onEnter = () => run(0.6);
    if (hover) el.addEventListener("mouseenter", onEnter);

    return () => {
      st.kill();
      gsap.killTweensOf(el);
      if (hover) el.removeEventListener("mouseenter", onEnter);
      el.textContent = text;
    };
  }, [text, hover]);

  const Tag = as;
  return <Tag ref={ref} className={className}>{text}</Tag>;
}
