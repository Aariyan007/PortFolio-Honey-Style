import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/theme.css";
import App from "./App.jsx";

// ── Console Easter Egg ──
console.log(
  `%c
    ╔═══════════════════════════════════╗
    ║                                   ║
    ║   Hey, you're curious.            ║
    ║   I like that.                    ║
    ║                                   ║
    ║   Built by Aariyan — 2026         ║
    ║   React · GSAP · ScrollSmoother   ║
    ║   No templates. All handcraft.    ║
    ║                                   ║
    ║   → github.com/Aariyan007        ║
    ║                                   ║
    ╚═══════════════════════════════════╝
`,
  "color: #ff3b30; font-family: monospace; font-size: 12px; line-height: 1.5;"
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);