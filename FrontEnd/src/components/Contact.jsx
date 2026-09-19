import "./Contact.css";

const SOCIALS = [
  { label: "GitHub",   href: "https://github.com/Aariyan007",  mono: "GH" },
  { label: "LinkedIn", href: "https://linkedin.com/in/aariyan", mono: "LI" },
  { label: "Twitter",  href: "https://twitter.com/aariyan007",  mono: "TW" },
];

export default function Contact() {
  return (
    <section id="contact-section" className="contact-section">
      <div className="contact-grain" aria-hidden="true" />
      <span className="contact-rule contact-rule--top" />

      <div className="contact-inner">
        <p className="contact-eyebrow">
          <span className="contact-eyebrow-dot" />
          OPEN FOR WORK — 2026
        </p>

        <h2 className="contact-headline">
          <span className="contact-line">Have something</span>
          <span className="contact-line contact-line--italic">unreasonable</span>
          <span className="contact-line">in mind?</span>
        </h2>

        <p className="contact-sub">
          Hardware, AI, full-stack — if it's hard and interesting, I'm in.
          <br />
          Drop me a line and we'll figure the rest out.
        </p>

        <a
          className="contact-email"
          href="mailto:aariyan007@gmail.com"
          aria-label="Send Aariyan an email"
        >
          <span className="contact-email-text">aariyan007@gmail.com</span>
          <span className="contact-email-arrow" aria-hidden="true">↗</span>
        </a>

        <span className="contact-rule contact-rule--mid" />

        <nav className="contact-socials" aria-label="Social links">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="contact-social-link"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-social-mono">{s.mono}</span>
              <span className="contact-social-label">{s.label}</span>
              <span className="contact-social-arrow">↗</span>
            </a>
          ))}
        </nav>
      </div>

      <footer className="contact-footer">
        <span className="contact-footer-name">AARIYAN — 2026</span>
        <span className="contact-footer-copy">Designed &amp; built by hand. No templates.</span>
        <span className="contact-footer-loc">🇮🇳 INDIA</span>
      </footer>
    </section>
  );
}
