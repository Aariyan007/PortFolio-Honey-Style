import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "../data/projects";
import "./ProjectArchive.css";

export default function ProjectArchive({ items, onOpen }) {
  const [filter, setFilter] = useState("all");
  const listRef = useRef(null);
  const firstRun = useRef(true);

  const counts = useMemo(
    () => Object.fromEntries(
      CATEGORIES.map((c) => [c.id, c.id === "all" ? items.length : items.filter((p) => p.category === c.id).length]),
    ),
    [items],
  );
  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((p) => p.category === filter)),
    [items, filter],
  );

  // rows cascade in the first time the list scrolls into view, then again on every filter change
  useEffect(() => {
    const list = listRef.current;
    if (!list || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = list.querySelectorAll(".parchive-row");
    const from = { opacity: 0, y: 14 };
    const to = { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power2.out" };
    const tween = firstRun.current
      ? gsap.fromTo(rows, from, { ...to, scrollTrigger: { trigger: list, start: "top 85%", once: true } })
      : gsap.fromTo(rows, from, to);
    firstRun.current = false;
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [filter]);

  return (
    <div className="parchive">
      <div className="parchive-head">
        <p className="parchive-eyebrow">ARCHIVE — {items.length} MORE</p>
        <div className="parchive-filters" role="group" aria-label="Filter projects by category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              className={`parchive-chip${filter === c.id ? " is-active" : ""}`}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
              <span className="parchive-chip-count">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="parchive-list" ref={listRef}>
        {visible.map((p) => {
          const cells = (
            <>
              <span className="parchive-year">{p.year}</span>
              <span className="parchive-title">{p.title}</span>
              <span className="parchive-desc">{p.description}</span>
              <span className="parchive-lang">{p.lang}</span>
              <span className="parchive-stars">{p.stars > 0 ? `★ ${p.stars}` : ""}</span>
              <ArrowUpRight size={16} className="parchive-arrow" aria-hidden="true" />
            </>
          );
          return (
            <li key={p.id} className="parchive-row">
              {p.href ? (
                <a className="parchive-link" href={p.href} target="_blank" rel="noreferrer">{cells}</a>
              ) : (
                <button type="button" className="parchive-link" onClick={() => onOpen(p)}>{cells}</button>
              )}
              {p.live && (
                <a className="parchive-live" href={p.live} target="_blank" rel="noreferrer">LIVE ↗</a>
              )}
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && <p className="parchive-empty">Nothing in this category yet.</p>}
    </div>
  );
}
