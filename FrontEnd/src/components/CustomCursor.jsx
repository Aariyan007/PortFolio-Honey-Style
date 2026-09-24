import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./CustomCursor.css";

/**
 * Lightweight custom cursor — single ring, no MutationObserver.
 * Morphs on hover using CSS classes + event delegation.
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor) return;

    // hide on touch devices
    if (matchMedia("(hover: none)").matches) {
      cursor.style.display = "none";
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    // single quickTo for smooth follow
    const qx = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
    const qy = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });

    const move = (e) => {
      qx(e.clientX);
      qy(e.clientY);
    };

    // Use event delegation on document — no per-element listeners needed
    const over = (e) => {
      // project cards get special "VIEW" label (check first since they're not <a>/<button>)
      const projectCard = e.target.closest(".project-card");
      if (projectCard) {
        cursor.classList.add("cursor--view");
        if (label) label.textContent = "VIEW";
        return;
      }

      const el = e.target.closest("a, button, .navbar-link, .navbar-cta, .contact-social-link");
      if (!el) return;
      cursor.classList.add("cursor--hover");
    };

    const out = (e) => {
      const projectCard = e.target.closest(".project-card");
      if (projectCard) {
        cursor.classList.remove("cursor--view");
        return;
      }
      const el = e.target.closest("a, button, .navbar-link, .navbar-cta, .contact-social-link");
      if (!el) return;
      cursor.classList.remove("cursor--hover", "cursor--view");
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
    <div className="custom-cursor" ref={cursorRef}>
      <span className="custom-cursor-label" ref={labelRef} />
    </div>
  );
}
