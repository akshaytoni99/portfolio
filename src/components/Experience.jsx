import { useCallback } from "react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./Experience.css";

const spring = { type: "spring", stiffness: 260, damping: 24 };
const viewport = { once: true, margin: "-80px" };

const accentColors = ["#6366f1", "#38bdf8", "#818cf8"];

export default function Experience() {
  const [ref, visible] = useScrollReveal(0.1);
  const experiences = useContent("experience").items ?? [];

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  return (
    <section id="experience" className="experience" ref={ref}>
      <div className={`experience-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Experience</div>
        <h2 className="section-title">
          My <span className="highlight">journey</span>
        </h2>

        <div className="exp-timeline">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id ?? exp.role}
              className="exp-card"
              style={{ "--accent": exp.color ?? accentColors[idx % accentColors.length] }}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={spring}
            >
              <div className="exp-timeline-marker">
                <motion.div
                  className="exp-dot"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={viewport}
                  transition={{ ...spring, delay: 0.15 }}
                />
                {idx < experiences.length - 1 && <div className="exp-line" />}
              </div>

              <div className="exp-content" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <span className="exp-type">{exp.tag}</span>
                <h3 className="exp-role">{exp.role}</h3>
                <div className="exp-company">{exp.company}</div>
                <div className="exp-meta">
                  <span className="exp-period">{exp.duration}</span>
                  <span className="exp-location">{exp.location}</span>
                </div>

                <p className="exp-desc" dangerouslySetInnerHTML={{ __html: exp.description }} />

                <ul className="exp-highlights">
                  {(exp.achievements ?? []).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="exp-card-glow" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
