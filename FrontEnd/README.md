# 🍯 Aariyan — Developer Portfolio ("Honey Style")

A modern, high-performance, editorial portfolio crafted with **React 19**, **Vite**, and **GSAP**. Built with bespoke dark-mode aesthetics, warm honey/amber accents, smooth kinetic typography, 3D interactive tilt cards, and mobile-first responsiveness.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## ✨ Highlights & Features

- **⚡ Performance-First Architecture**: RAF-throttled hover and parallax effects, GPU-accelerated transforms, zero layout shifts, and smooth 60fps animations.
- **🎬 Editorial Hero & Kinetic Typography**: Interactive character-split bounce with `SplitText`, subtle parallax mouse tracking, and framing aesthetics.
- **🌊 GSAP ScrollSmoother Integration**: Fluid buttery smooth scrolling experience paired with real-time reading progress indicators.
- **🪐 Interactive Experience Timeline**: Connected visual node thread tracing career milestones and engineering experience.
- **🃏 3D Tilt Project Cards**: Dynamic mouse-following radial spotlight, hover elevation, quick-links directly to GitHub repositories, and full project metadata.
- **📜 Word-by-Word Scroll Reveal**: Engaging storytelling in the About section where text illuminates progressively as the user scrolls.
- **📱 Fully Responsive**: Thoughtfully tuned breakpoints for mobile (iPhone, Android), tablets, laptops, and ultra-wide displays.
- **🌓 Contrast Bleed Contact**: Seamless transition from deep cosmic dark mode into an editorial light-paper contact card.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Animation Suite**: [GSAP](https://greensock.com/gsap/) (`ScrollSmoother`, `ScrollTrigger`, `SplitText`)
- **Styling**: Vanilla CSS (Custom Design System tokens) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
PortFolio/
├── FrontEnd/
│   ├── public/             # Static assets (favicons, videos, media)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── Contact.jsx         # Contact section & social links
│   │   │   ├── CustomCursor.jsx    # Smooth trailing cursor
│   │   │   ├── Experience.jsx      # Interactive timeline
│   │   │   ├── Loader.jsx          # Initial loading sequence
│   │   │   ├── Marquee.jsx         # Infinite skill ticker
│   │   │   ├── Navbar.jsx          # Dynamic header & quick contact modal
│   │   │   ├── Projects.jsx        # Project showcases & stats
│   │   │   └── ScrollProgress.jsx  # Page scroll progress bar
│   │   ├── hooks/          # Reusable custom hooks
│   │   │   └── useMagnetic.js      # Magnetic cursor physics
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Main portfolio layout & GSAP context
│   │   │   └── Home.css            # Hero & About styles
│   │   ├── App.jsx         # App root
│   │   ├── index.css       # Global styles & design variables
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aariyan007/PortFolio-Honey-Style.git
   cd PortFolio-Honey-Style/FrontEnd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173/`

---

## 📦 Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with instant Hot Module Replacement (HMR) |
| `npm run build` | Bundles and optimizes the production build |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint to check for code quality issues |

---

## 📬 Contact & Links

- **Developer**: Aariyan
- **GitHub**: [@Aariyan007](https://github.com/Aariyan007)
- **LinkedIn**: [aariyan-s](https://www.linkedin.com/in/aariyan-s/)
- **Email**: [aariyansunu28@gmail.com](mailto:aariyansunu28@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).
