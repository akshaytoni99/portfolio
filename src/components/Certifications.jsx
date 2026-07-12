import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./Certifications.css";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

// Icons stay in-component (JSX cannot live in JSON content); keyed by seed id,
// with a generic fallback for certifications added through the admin.
const certIcons = {
  "cert-genai-rag-udemy": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 014-4z" />
      <path d="M8 8v4m8-4v4M6 16a6 6 0 0012 0" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  "cert-python-basics": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "cert-ml-dl-ai-master": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M7.5 7.5l3 3m3 3l3 3M16.5 7.5l-3 3m-3 3l-3 3" />
    </svg>
  ),
  "cert-data-science-sla": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  "cert-python-ds-ibm": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  "cert-claude-code-anthropic": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 17l6-6-6-6" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
};

const defaultCertIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

export default function Certifications() {
  const [ref, visible] = useScrollReveal(0.1);
  const certifications = useContent("certifications").items ?? [];

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
          {certifications.map((cert) => {
            const href = cert.credentialUrl || "";
            const Card = href ? motion.a : motion.div;
            return (
              <Card
                key={cert.id ?? cert.title}
                className={`cert-card ${href ? "cert-card-link" : ""}`}
                style={{ "--accent": cert.color ?? "#6366f1" }}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                {...(href
                  ? {
                      href,
                      target: "_blank",
                      rel: "noreferrer",
                      "aria-label": `${cert.title} — view credential`,
                    }
                  : {})}
              >
                <div className="cert-ic">{certIcons[cert.id] ?? defaultCertIcon}</div>
                <div className="cert-info">
                  <h3 className="cert-title">{cert.title}</h3>
                  <div className="cert-meta">
                    <span className="cert-issuer">{cert.issuer}</span>
                    {cert.date ? <span className="cert-date">· {cert.date}</span> : null}
                  </div>
                  {href ? (
                    <span className="cert-verified">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Verified credential
                    </span>
                  ) : null}
                </div>
                {href ? (
                  <span className="cert-arrow" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="8 7 17 7 17 16" />
                    </svg>
                  </span>
                ) : null}
                <div className="cert-sheen" />
              </Card>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
