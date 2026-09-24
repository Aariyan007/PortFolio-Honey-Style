import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Marquee.css";

gsap.registerPlugin(ScrollTrigger);

export default function Marquee({ items = [], label }) {
  const trackRef = useRef(null);
  const track2Ref = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const track1 = trackRef.current;
    const track2 = track2Ref.current;
    const wrap = wrapRef.current;
    if (!track1 || !wrap) return;

    // Row 1 — scrolls left
    const tween1 = gsap.to(track1, {
      xPercent: -50,
      duration: Math.max(items.length * 3, 12),
      ease: "none",
      repeat: -1,
    });

    // Row 2 — scrolls right (opposite direction)
    let tween2;
    if (track2) {
      gsap.set(track2, { xPercent: -50 });
      tween2 = gsap.to(track2, {
        xPercent: 0,
        duration: Math.max(items.length * 3.5, 14),
        ease: "none",
        repeat: -1,
      });
    }

    // Velocity skew — tilts based on scroll speed (throttled with dead-zone)
    let lastSkew = 0;
    const skewTrigger = gsap.fromTo(
      wrap,
      { skewY: 0 },
      {
        skewY: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-4, 4, self.getVelocity() / -400);
            if (Math.abs(v - lastSkew) > 0.15) {
              lastSkew = v;
              gsap.to(wrap, { skewY: v, duration: 0.3, overwrite: true });
            }
          },
        },
      }
    );

    return () => {
      tween1.kill();
      tween2?.kill();
      skewTrigger?.scrollTrigger?.kill();
      skewTrigger?.kill();
    };
  }, [items]);

  return (
    <section className="marquee-section">
      {label && <p className="marquee-label">{label}</p>}

      <div className="marquee-wrap" ref={wrapRef}>
        {/* Row 1 — left scroll */}
        <div className="marquee-track" ref={trackRef}>
          {[...items, ...items].map((item, i) => (
            <span className="marquee-item" key={`r1-${i}`}>
              {item}
            </span>
          ))}
        </div>

        {/* Row 2 — right scroll (reversed items, dimmer) */}
        <div className="marquee-track marquee-track--reverse" ref={track2Ref}>
          {[...items, ...items].reverse().map((item, i) => (
            <span className="marquee-item marquee-item--dim" key={`r2-${i}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}