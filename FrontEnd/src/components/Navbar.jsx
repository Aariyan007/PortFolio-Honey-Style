import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, X } from "lucide-react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./Navbar.css";

gsap.registerPlugin(ScrollSmoother);

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 23.227 24 22.271 24 21.729V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function scrollToTarget(target) {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, true, typeof target === "number" ? undefined : "top 100");
  } else if (typeof target !== "number") {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}

export default function Navbar() {
  const navRef = useRef(null);
  const contactOverlayRef = useRef(null);
  const contactCardRef = useRef(null);
  const [contactOpen, setContactOpen] = useState(false);

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

  // ── Magnetic hover on nav links ──
  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    const els = navRef.current?.querySelectorAll(".navbar-link, .navbar-cta");
    if (!els?.length) return;

    const cleanups = Array.from(els).map((el) => {
      const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      const move = (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        qx(dx * 0.3);
        qy(dy * 0.35);
      };
      const leave = () => { qx(0); qy(0); };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        gsap.set(el, { x: 0, y: 0 });
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // ── Hide navbar on scroll-down, show on scroll-up ──
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > lastScroll && y > 100) {
        nav.classList.add("navbar--hidden");
      } else {
        nav.classList.remove("navbar--hidden");
      }
      lastScroll = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (!contactOpen) return;

    const overlay = contactOverlayRef.current;
    const card = contactCardRef.current;
    if (!overlay || !card) return;

    const revealItems = card.querySelectorAll(".contact-reveal");
    const tl = gsap.timeline();

    gsap.set(overlay, { opacity: 0 });
    gsap.set(card, { opacity: 0, y: 70, scale: 0.94, filter: "blur(12px)" });
    gsap.set(revealItems, { opacity: 0, y: 18 });

    tl.to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .to(card, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power4.out" }, "-=0.15")
      .to(revealItems, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: "power3.out" }, "-=0.35");

    document.body.style.overflow = "hidden";

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [contactOpen]);

  const closeContact = () => {
    const overlay = contactOverlayRef.current;
    const card = contactCardRef.current;

    if (!overlay || !card) {
      setContactOpen(false);
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setContactOpen(false) });

    tl.to(card, { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)", duration: 0.35, ease: "power3.in" })
      .to(overlay, { opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.15");
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    scrollToTarget(0);
  };

  const handleProjectsClick = (e) => {
    e.preventDefault();
    const target = document.querySelector("#projects-section");
    if (target) scrollToTarget(target);
  };

  return (
    <>
      <header className="navbar" ref={navRef}>
        <div className="navbar-logo">
          <a href="#top" className="navbar-logo-link" onClick={handleLogoClick}>
            S.Aariyan
          </a>
          <span className="navbar-year">2026</span>
        </div>

        <nav className="navbar-links">
          <a href="mailto:aariyansunu28@gmail.com" className="navbar-link">
            <Mail size={13} className="navbar-icon" />
            AARIYANSUNU28@GMAIL.COM
          </a>

          <a href="#projects-section" className="navbar-link" onClick={handleProjectsClick}>
            PROJECTS
          </a>

          <a
            href="https://www.linkedin.com/in/aariyan-s/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link"
          >
            <LinkedinIcon className="navbar-icon" />
            LINKEDIN
          </a>
        </nav>

        <div className="navbar-button">
          <button type="button" className="navbar-cta" onClick={() => setContactOpen(true)}>
            CONTACT ME
          </button>
        </div>
      </header>

      {contactOpen &&
        createPortal(
          <div
            className="contact-overlay"
            ref={contactOverlayRef}
            onClick={(e) => {
              if (e.target === contactOverlayRef.current) closeContact();
            }}
          >
            <div className="contact-card" ref={contactCardRef}>
              <button type="button" className="contact-close" onClick={closeContact} aria-label="Close contact">
                <X size={20} />
              </button>

              <span className="contact-reveal contact-eyebrow">GET IN TOUCH</span>

              <h2 className="contact-reveal">
                Let's build something
                <span> interesting.</span>
              </h2>

              <p className="contact-reveal">
                Have a project, opportunity, or just want to talk tech?
                Drop me a message.
              </p>

              <a className="contact-reveal contact-email" href="mailto:aariyansunu28@gmail.com">
                <Mail size={17} />
                aariyansunu28@gmail.com
              </a>

              <div className="contact-reveal contact-links">
                <a href="https://www.linkedin.com/in/aariyan-s/" target="_blank" rel="noopener noreferrer">
                  LINKEDIN ↗
                </a>
                <a href="https://github.com/Aariyan007" target="_blank" rel="noopener noreferrer">
                  GITHUB ↗
                </a>
              </div>

              <div className="contact-footer contact-reveal">
                <span>AVAILABLE FOR OPPORTUNITIES</span>
                <span className="contact-status">
                  <i />
                  ONLINE
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}