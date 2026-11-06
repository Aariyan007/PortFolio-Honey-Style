import { useEffect, useState } from "react";

// Index of the section crossing the vertical middle of the viewport.
export default function useActiveSection(ids) {
  const [active, setActive] = useState(0);
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|");
    const els = list.map((id) => document.getElementById(id));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = els.indexOf(entry.target);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
