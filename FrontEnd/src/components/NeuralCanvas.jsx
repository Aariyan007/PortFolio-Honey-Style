import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { resolveFormation } from "../three/scrollMap.js";
import { createQualityMonitor } from "../three/quality.js";
import { HIGHLIGHT_EVENT } from "../three/events.js";
import { canUseWebGL } from "../three/webgl.js";
import { SECTION_IDS } from "../data/sections.js";
import "./NeuralCanvas.css";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// layout top (ignores transforms, so ScrollSmoother's translate doesn't skew it)
function absoluteTop(el) {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
}

export default function NeuralCanvas({ onReady }) {
  const canvasRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(hover: none)").matches || window.innerWidth < 768;
    const cleanups = [];
    let scene = null;
    let cancelled = false;

    const fail = (err) => {
      if (cancelled) return;
      console.warn("NeuralCanvas: WebGL unavailable, showing fallback.", err);
      setFailed(true);
      onReadyRef.current?.();
    };

    // ?nowebgl forces the same probe failure a real unsupported device hits
    const forceFail = new URLSearchParams(window.location.search).has("nowebgl");
    if (!canUseWebGL(document, { forceFail })) {
      // microtask: a StrictMode remount cancels the first run, so only one warning is logged
      const err = new Error(forceFail ? "disabled by ?nowebgl" : "WebGL2 unavailable");
      Promise.resolve().then(() => fail(err));
      return () => {
        cancelled = true;
      };
    }

    import("../three/NeuralScene.js")
      .then(({ default: NeuralScene }) => {
        if (cancelled) return;
        try {
          scene = new NeuralScene(canvas, {
            nodeCount: mobile ? 500 : 1400,
            dpr: mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
            animate: !reduced,
          });
        } catch (err) {
          fail(err);
          return;
        }

        // ignore ~6 s of boot frames: the loader reel, ScrollSmoother and SplitText setup are not steady-state cost
        const monitor = createQualityMonitor({ warmupMs: 6000 });
        scene.onFrame = (dt) => {
          if (monitor.tier === "high" && monitor.sample(dt) === "low") scene.setQuality("low");
        };

        let tops = [];
        const measure = () => {
          tops = SECTION_IDS.map((id) => {
            const el = document.getElementById(id);
            return el ? absoluteTop(el) : Infinity;
          });
        };
        measure();
        ScrollTrigger.addEventListener("refresh", measure);
        cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measure));

        let last = -1;
        const sync = () => {
          const smoother = ScrollSmoother.get();
          const y = smoother ? smoother.scrollTop() : window.scrollY;
          const f = resolveFormation(y, window.innerHeight, tops);
          const mix = reduced ? (f.mix >= 0.5 ? 1 : 0) : f.mix;
          const p = f.from + mix;
          if (Math.abs(p - last) < 1e-4) return;
          last = p;
          scene.setProgress(p); // the scene eases toward p, so fast scrolls still morph slowly
        };
        gsap.ticker.add(sync);
        cleanups.push(() => gsap.ticker.remove(sync));

        if (!mobile && !reduced) {
          const move = (e) =>
            scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
          window.addEventListener("mousemove", move, { passive: true });
          cleanups.push(() => window.removeEventListener("mousemove", move));
        }

        const onHighlight = (e) => scene.highlightCluster(e.detail.cluster);
        window.addEventListener(HIGHLIGHT_EVENT, onHighlight);
        cleanups.push(() => window.removeEventListener(HIGHLIGHT_EVENT, onHighlight));

        const onResize = () => scene.resize();
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        const onVisibility = () => (document.hidden ? scene.pause() : scene.resume());
        document.addEventListener("visibilitychange", onVisibility);
        cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

        scene.start();
        requestAnimationFrame(() => {
          if (!cancelled) onReadyRef.current?.();
        });
      })
      .catch(fail);

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      scene?.dispose();
    };
  }, []);

  return failed ? (
    <div className="neural-fallback" aria-hidden="true" />
  ) : (
    <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
  );
}
