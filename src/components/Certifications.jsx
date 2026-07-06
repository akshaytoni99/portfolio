import { useCallback } from "react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./Certifications.css";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

// Icons stay in-component (JSX cannot live in JSON content); keyed by seed id,
// with a generic fallback for certifications added through the admin.
const certIcons = {
  "cert-genai-rag-udemy": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 014-4z" />
      <path d="M8 8v4m8-4v4M6 16a6 6 0 0012 0" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  "cert-python-basics": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "cert-ml-dl-ai-master": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M7.5 7.5l3 3m3 3l3 3M16.5 7.5l-3 3m-3 3l-3 3" />
    </svg>
  ),
  "cert-data-science-sla": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  "cert-python-ds-ibm": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

const defaultCertIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

export default function Certifications() {
  const [ref, visible] = useScrollReveal(0.1);
  const certifications = useContent("certifications").items ?? [];

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
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

        <motion.div
          className="certs-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {certifications.map((cert) => (
            <motion.div
              key={cert.id ?? cert.title}
              className="cert-card"
              style={{ "--accent": cert.color ?? "#6366f1" }}
              variants={cardVariants}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="cert-card-glow" />
              <div className="cert-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cert.color ?? "#6366f1"} strokeWidth="1.5">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                </svg>
              </div>
              <div className="cert-icon" style={{ color: cert.color ?? "#6366f1" }}>
                {certIcons[cert.id] ?? defaultCertIcon}
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <span className="cert-issuer">{cert.issuer}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
