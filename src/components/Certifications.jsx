import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Certifications.css";

const certifications = [
  {
    title: "Generative AI, LLMs & RAG using LangChain and Hugging Face",
    issuer: "Udemy",
    color: "#a855f7",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 014-4z" />
        <path d="M8 8v4m8-4v4M6 16a6 6 0 0012 0" />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
        <circle cx="15" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Certified Python Basics",
    issuer: "Pantech Solutions",
    color: "#ec4899",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Certified Master in Machine Learning, Deep Learning & AI",
    issuer: "Pantech Solutions",
    color: "#f97316",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M7.5 7.5l3 3m3 3l3 3M16.5 7.5l-3 3m-3 3l-3 3" />
      </svg>
    ),
  },
  {
    title: "Data Science Certification with Grade 'A'",
    issuer: "SLA Institute",
    color: "#c084fc",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    title: "Python for Data Science",
    issuer: "IBM",
    color: "#fb923c",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

export default function Certifications() {
  const [ref, visible] = useScrollReveal(0.1);

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  return (
    <section id="certifications" className="certifications" ref={ref}>
      <div className={`certs-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Certifications</div>
        <h2 className="section-title">
          Professional <span className="highlight">credentials</span>
        </h2>

        <div className="certs-grid">
          {certifications.map((cert, idx) => (
            <div
              key={cert.title}
              className="cert-card"
              style={{
                "--accent": cert.color,
                transitionDelay: `${idx * 0.12}s`,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="cert-card-glow" />
              <div className="cert-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="1.5">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                </svg>
              </div>
              <div className="cert-icon" style={{ color: cert.color }}>
                {cert.icon}
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <span className="cert-issuer">{cert.issuer}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
