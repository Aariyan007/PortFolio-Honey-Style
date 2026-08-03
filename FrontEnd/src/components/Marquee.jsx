import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Marquee.css";

export default function Marquee({ items = [], label }) {
  const trackRef = useRef(null);

  useEffect(() => {
    // xPercent: -50 moves exactly one copy of the (duplicated) content
    // width to the left, then repeats — since the second copy is
    // identical to the first, the loop point is invisible.
    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: Math.max(items.length * 3, 12),
      ease: "none",
      repeat: -1,
    });

    return () => tween.kill();
  }, [items]);

  return (
    <section className="marquee-section">
      {label && <p className="marquee-label">{label}</p>}

      <div className="marquee-wrap">
        <div className="marquee-track" ref={trackRef}>
          {[...items, ...items].map((item, i) => (
            <span className="marquee-item" key={i}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}