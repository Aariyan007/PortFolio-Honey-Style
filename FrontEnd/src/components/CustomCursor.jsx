import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./CustomCursor.css";

const INTERACTIVE = "a, button, .navbar-link, .navbar-cta, .contact-social-link";

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const touch = matchMedia("(hover: none)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch || reduced) {
      ring.style.display = "none";
      dot.style.display = "none";
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    let snapEl = null;

    const move = (e) => {
      dx(e.clientX);
      dy(e.clientY);
      if (snapEl) {
        const r = snapEl.getBoundingClientRect();
        rx(r.left + r.width / 2);
        ry(r.top + r.height / 2);
      } else {
        rx(e.clientX);
        ry(e.clientY);
      }
    };

    const over = (e) => {
      const mag = e.target.closest("[data-magnetic]");
      if (mag) {
        snapEl = mag;
        const r = mag.getBoundingClientRect();
        ring.style.setProperty("--snap-w", `${r.width + 18}px`);
        ring.style.setProperty("--snap-h", `${r.height + 14}px`);
        ring.classList.add("cursor--snap");
        return;
      }
      if (e.target.closest(".project-card")) {
        ring.classList.add("cursor--view");
        if (labelRef.current) labelRef.current.textContent = "VIEW";
        return;
      }
      if (e.target.closest(INTERACTIVE)) ring.classList.add("cursor--hover");
    };

    const out = (e) => {
      const to = e.relatedTarget;
      if (snapEl && (!to || !snapEl.contains(to))) {
        snapEl = null;
        ring.classList.remove("cursor--snap");
      }
      if (e.target.closest(".project-card") && !(to && to.closest?.(".project-card"))) {
        ring.classList.remove("cursor--view");
      }
      if (e.target.closest(INTERACTIVE) && !(to && to.closest?.(INTERACTIVE))) {
        ring.classList.remove("cursor--hover");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div className="custom-cursor" ref={ringRef}>
        <span className="custom-cursor-label" ref={labelRef} />
      </div>
      <div className="custom-cursor-dot" ref={dotRef} />
    </>
  );
}
