import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollProgress.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Thin accent-colored bar at the top of the viewport
 * that fills as the user scrolls through the page.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });

    return () => trigger.kill();
  }, []);

  return <div className="scroll-progress" ref={barRef} />;
}
