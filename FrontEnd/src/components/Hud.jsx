import { useEffect, useRef, useState } from "react";
import useActiveSection from "../hooks/useActiveSection";
import { SECTIONS, SECTION_IDS } from "../data/sections";
import "./Hud.css";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function Hud() {
  const coordsRef = useRef(null);
  const [clock, setClock] = useState(() => clockFormat.format(new Date()));
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const id = setInterval(() => setClock(clockFormat.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!coordsRef.current) return;
        coordsRef.current.textContent =
          `X:${String(e.clientX).padStart(4, "0")} Y:${String(e.clientY).padStart(4, "0")}`;
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const section = SECTIONS[active] ?? SECTIONS[0];

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-bracket hud-bracket--tl" />
      <span className="hud-bracket hud-bracket--tr" />
      <span className="hud-bracket hud-bracket--bl" />
      <span className="hud-bracket hud-bracket--br" />
      <span className="hud-section">
        {String(active + 1).padStart(2, "0")} / {section.label}
      </span>
      <span className="hud-coords" ref={coordsRef}>X:0000 Y:0000</span>
      <span className="hud-clock">IST {clock}</span>
    </div>
  );
}
