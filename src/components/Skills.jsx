import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Skills.css";

const skillCategories = [
  {
    title: "Programming & Data",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
    skills: ["Python", "SQL", "Pandas", "NumPy", "Data Processing"],
    color: "#a855f7",
  },
  {
    title: "Machine Learning",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5">
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M7.5 7.5l3 3m3 3l3 3M16.5 7.5l-3 3m-3 3l-3 3" />
      </svg>
    ),
    skills: ["Scikit-learn", "TensorFlow", "PyTorch", "Deep Learning"],
    color: "#ec4899",
  },
  {
    title: "Generative AI",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 014-4z" />
        <path d="M8 8v4m8-4v4M6 16a6 6 0 0012 0" />
        <circle cx="9" cy="14" r="1" fill="#ec4899" />
        <circle cx="15" cy="14" r="1" fill="#ec4899" />
      </svg>
    ),
    skills: ["GPT", "Claude", "LLaMA", "Mistral", "Gemini"],
    color: "#ec4899",
  },
  {
    title: "LLM Frameworks & Tools",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    skills: ["LangChain", "LangGraph", "Hugging Face", "Groq", "NVIDIA NIM"],
    color: "#c084fc",
  },
];

export default function Skills() {
  const [ref, visible] = useScrollReveal(0.1);

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    const glowX = ((x / rect.width) * 100).toFixed(1);
    const glowY = ((y / rect.height) * 100).toFixed(1);
    card.style.setProperty("--glow-x", `${glowX}%`);
    card.style.setProperty("--glow-y", `${glowY}%`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  return (
    <section id="skills" className="skills" ref={ref}>
      <div className={`skills-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Skills</div>
        <h2 className="section-title">
          My <span className="highlight">tech stack</span>
        </h2>

        <div className="skills-grid">
          {skillCategories.map((cat, idx) => (
            <div
              key={cat.title}
              className="skill-card"
              style={{
                "--accent": cat.color,
                transitionDelay: `${idx * 0.1}s`,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="skill-card-header">
                <div className="skill-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
              </div>
              <div className="skill-tags">
                {cat.skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="skill-card-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
