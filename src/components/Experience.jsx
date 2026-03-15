import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Experience.css";

const experiences = [
  {
    role: "Data Science Trainee",
    company: "SLA Institute",
    location: "Chennai, Tamil Nadu",
    period: "Mar 2025 – Aug 2025",
    type: "Training",
    color: "#a855f7",
    description:
      "Intensive training in Data Science, Machine Learning, and AI application development with hands-on projects.",
    highlights: [
      "Built end-to-end ML pipelines with Python, Pandas, and Scikit-learn",
      "Developed LLM-powered applications using LangChain and RAG architecture",
      "Worked with vector databases (FAISS, ChromaDB) for semantic search systems",
    ],
  },
  {
    role: "B.Tech in AI & Data Science",
    company: "Annai Mira College of Engineering and Technology",
    location: "Ranipet, Tamil Nadu",
    period: "Sep 2022 – May 2025",
    type: "Education",
    color: "#ec4899",
    description:
      "Completed Bachelor of Technology in Artificial Intelligence and Data Science with a focus on ML, NLP, and deep learning.",
    highlights: [
      "Built Hate Speech Detection system using NLP and TF-IDF as capstone project",
      "Gained expertise in Python, Machine Learning, and Deep Learning",
      "Studied core AI concepts including NLP, model evaluation, and feature engineering",
    ],
  },
  {
    role: "Diploma in Mechanical Engineering",
    company: "Thanthai Periyar Government Polytechnic College",
    location: "Vellore, Tamil Nadu",
    period: "Mar 2020 – Mar 2022",
    type: "Education",
    color: "#c084fc",
    description:
      "Completed Diploma in Mechanical Engineering, building a strong analytical and problem-solving foundation before transitioning to AI.",
    highlights: [
      "Developed strong analytical thinking and engineering fundamentals",
      "Transitioned from mechanical engineering to AI & Data Science",
    ],
  },
];

export default function Experience() {
  const [ref, visible] = useScrollReveal(0.1);

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
            <div
              key={exp.role}
              className="exp-card"
              style={{
                "--accent": exp.color,
                animationDelay: `${idx * 0.15}s`,
              }}
            >
              <div className="exp-timeline-marker">
                <div className="exp-dot" />
                {idx < experiences.length - 1 && <div className="exp-line" />}
              </div>

              <div className="exp-content" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <span className="exp-type">{exp.type}</span>
                <h3 className="exp-role">{exp.role}</h3>
                <div className="exp-company">{exp.company}</div>
                <div className="exp-meta">
                  <span className="exp-period">{exp.period}</span>
                  <span className="exp-location">{exp.location}</span>
                </div>

                <p className="exp-desc">{exp.description}</p>

                <ul className="exp-highlights">
                  {exp.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="exp-card-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
