import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Contact.css";

export default function Contact() {
  const [ref, visible] = useScrollReveal(0.2);

  return (
    <section id="contact" className="contact" ref={ref}>
      <div className={`contact-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Contact</div>
        <h2 className="section-title">
          Let's <span className="highlight">connect</span>
        </h2>
        <p className="contact-subtitle">
          Interested in working together? I'm always open to discussing new
          projects, creative ideas, or opportunities to be part of your vision.
        </p>

        <div className="contact-grid">
          <a href="mailto:akshaytoni99@gmail.com" className="contact-card">
            <div className="contact-icon" style={{ "--accent": "#a855f7" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h3>Email</h3>
              <span>akshaytoni99@gmail.com</span>
            </div>
          </a>

          <a href="https://www.linkedin.com/in/akshaytoni99/" target="_blank" rel="noreferrer" className="contact-card">
            <div className="contact-icon" style={{ "--accent": "#ec4899" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
            <div>
              <h3>LinkedIn</h3>
              <span>Connect with me</span>
            </div>
          </a>

          <a href="https://github.com/akshaytoni99" target="_blank" rel="noreferrer" className="contact-card">
            <div className="contact-icon" style={{ "--accent": "#f97316" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
              </svg>
            </div>
            <div>
              <h3>GitHub</h3>
              <span>Check my repos</span>
            </div>
          </a>
        </div>
      </div>

    </section>
  );
}
