import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getGreetingsForBucket } from "../data/greetings";
import { createGate } from "../lib/gate";
import "./Loader.css";

function getTimeBucket() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 21) return "evening";
  return "night";
}

const BOOT = "initializing neural graph…";

export default function Loader({ onFinish, ready }) {
  const wrapRef = useRef(null);
  const reelRef = useRef(null);
  const glowRef = useRef(null);
  const underlineRef = useRef(null);
  const bootRef = useRef(null);
  const gateRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  const [bucket] = useState(getTimeBucket);

  const [words] = useState(() => {
    const all = getGreetingsForBucket(bucket);
    const english = all.find((w) => w.lang === "English");
    const rest = gsap.utils.shuffle(all.filter((w) => w.lang !== "English"));
    return [...rest, english];
  });

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const reel = reelRef.current;
    const itemH = reel.firstChild.offsetHeight;
    const lastIndex = words.length - 1;
    const lastItem = reel.lastChild;
    const pct = { v: 0 };
    const setBoot = (n) => {
      if (bootRef.current) bootRef.current.textContent = `${BOOT} ${n}%`;
    };

    gsap.set(reel, { y: 0 });
    gsap.set([glowRef.current, underlineRef.current], { opacity: 0 });

    const tl = gsap.timeline();
    // play on the next frame: resuming from inside GSAP's own addPause callback is not reliable
    const gate = createGate({ timeoutMs: 5000, onOpen: () => { setBoot(100); requestAnimationFrame(() => tl.play()); } });
    gateRef.current = gate;

    tl.to(reel, { y: -lastIndex * itemH, duration: 2.6, ease: "power4.out" }, 0)
      .fromTo(reel, { filter: "blur(9px)" }, { filter: "blur(0px)", duration: 2.6, ease: "power4.out" }, 0)
      .to(pct, {
        v: 90,
        duration: 2.6,
        ease: "power2.out",
        onUpdate: () => setBoot(gate.fired ? 100 : Math.round(pct.v)),
      }, 0)
      .addLabel("landed")
      .fromTo(lastItem, { scale: 0.9 }, { scale: 1.08, duration: 0.26, ease: "back.out(3)" }, "landed")
      .to(lastItem, { scale: 1, duration: 0.22, ease: "power2.out" }, "landed+=0.26")
      .to(glowRef.current, { opacity: 1, scale: 1.15, duration: 0.5, ease: "power2.out" }, "landed")
      .to(glowRef.current, { opacity: 0, duration: 0.5, ease: "power2.in" }, "landed+=0.9")
      .fromTo(underlineRef.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.45, ease: "power3.out" }, "landed+=0.05")
      .addPause("landed+=1.1", () => gate.reach())
      .to(wrapRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          onFinishRef.current?.();
        },
      }, "landed+=1.1");

    return () => {
      gate.dispose();
      gateRef.current = null;
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [words]);

  useEffect(() => {
    if (ready) gateRef.current?.open();
  }, [ready]);

  return (
    <div className="loader" ref={wrapRef}>
      <div className="loader-stage">
        <div className="loader-glow" ref={glowRef} />
        <div className="loader-window">
          <div className="loader-reel" ref={reelRef}>
            {words.map((w) => (
              <span className="loader-item" key={w.lang}>{w.text}</span>
            ))}
          </div>
        </div>
        <span className="loader-underline" ref={underlineRef} />
      </div>
      <p className="loader-boot" ref={bootRef}>{BOOT} 0%</p>
    </div>
  );
}
