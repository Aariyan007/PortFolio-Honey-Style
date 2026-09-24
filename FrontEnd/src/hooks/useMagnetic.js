import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Magnetic hover effect — element subtly pulls toward the mouse.
 * Attaches listeners to `ref.current` and cleans up on unmount.
 *
 * @param {Object}  options
 * @param {number}  options.strength  - how far the element moves (px). Default 12.
 * @param {number}  options.radius    - activation radius factor (1 = element bounds). Default 1.4.
 * @returns {React.RefObject} ref to attach to the target element
 */
export default function useMagnetic({ strength = 12, radius = 1.4 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // skip on touch
    if (matchMedia("(hover: none)").matches) return;

    const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

    const move = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height) * radius;

      if (dist < maxDist) {
        const factor = 1 - dist / maxDist;
        qx(dx * factor * (strength / maxDist) * maxDist * 0.06);
        qy(dy * factor * (strength / maxDist) * maxDist * 0.06);
      }
    };

    const leave = () => {
      qx(0);
      qy(0);
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius]);

  return ref;
}
