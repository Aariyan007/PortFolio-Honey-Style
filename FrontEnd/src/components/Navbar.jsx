import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import gsap from "gsap";
import "./Navbar.css";

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Navbar() {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current.children, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-logo">
        S.Aariyan
        <span className="navbar-year">2026</span>
      </div>

      <nav className="navbar-links">
        <a href="mailto:aariyansunu28@gmail.com" className="navbar-link">
          <Mail size={13} className="navbar-icon" /> AARIYANSUNU28@GMAIL.COM
        </a>
        <a href="#projects" className="navbar-link">
          PROJECTS
        </a>
        <a href="#linkedin" className="navbar-link">
          <LinkedinIcon className="navbar-icon" /> LINKEDIN
        </a>
      </nav>
      <div ClassName="navbar-button">
        <button className="navbar-cta" onClick={() => window.location.href = "#contact"}>
          CONTACT ME
        </button>
      </div>
    </header>
  );
}