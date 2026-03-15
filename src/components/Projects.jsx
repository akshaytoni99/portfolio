import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Projects.css";

const projects = [
  {
    title: "Multi-Agent AI Applications with LangGraph",
    description:
      "Built stateful multi-agent AI systems using LangGraph to enable collaborative AI workflows and intelligent automation.",
    tags: ["LangGraph", "LLM", "Multi-Agent Systems", "Python"],
    github: "https://github.com/akshaytoni99/Multi-Agent-AI-Applications-with-LangGraph",
    color: "#a855f7",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <path d="M8.5 7.5l3 5m4-5l-3 5" />
      </svg>
    ),
  },
  {
    title: "PDF Query RAG System with LangChain & AstraDB",
    description:
      "Developed a Retrieval-Augmented Generation (RAG) system that enables querying PDF documents using LLMs, embeddings, and AstraDB vector database.",
    tags: ["RAG", "LangChain", "AstraDB", "LLM"],
    github: "https://github.com/akshaytoni99/PDF-Query-RAG-System-with-LangChain-AstraDB",
    color: "#ec4899",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="11" cy="15" r="3" />
        <line x1="21" y1="21" x2="13.5" y2="17.5" />
      </svg>
    ),
  },
  {
    title: "InsightStream AI Web & YouTube Summarization",
    description:
      "AI-powered system that extracts and summarizes web articles and YouTube videos using LLMs to help users quickly understand long-form content.",
    tags: ["LLM", "NLP", "Content Summarization"],
    github: "https://github.com/akshaytoni99/InsightStream-AI-LLM-Powered-Web-YouTube-Summarization-System",
    color: "#ec4899",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    title: "Smart Web Data Miner with LLM Processing",
    description:
      "Developed an intelligent web data mining tool that scrapes online content and processes it using LLMs to extract structured insights.",
    tags: ["Web Scraping", "LLM", "NLP"],
    github: "https://github.com/akshaytoni99/Smart-Web-Data-Miner-with-LLM-Based-Content-Processing",
    color: "#c084fc",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: "LLM-Powered SQL Database Chatbot",
    description:
      "Built a conversational AI chatbot that allows users to interact with SQL databases using natural language queries.",
    tags: ["LangChain", "SQL", "Streamlit", "LLM"],
    github: "https://github.com/akshaytoni99/LLM-Powered-SQL-Database-Chatbot-using-LangChain-and-Streamlit",
    color: "#c084fc",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <path d="M8 10h8M8 14h4" />
      </svg>
    ),
  },
  {
    title: "Hate Speech Detection using ML",
    description:
      "Machine learning model that detects and classifies hate speech in text using NLP techniques and supervised learning algorithms.",
    tags: ["Machine Learning", "NLP", "Text Classification"],
    github: "https://github.com/akshaytoni99/hate-speech-detection-using-machine-learning",
    color: "#6d28d9",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Projects() {
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
    <section id="projects" className="projects" ref={ref}>
      <div className={`projects-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Projects</div>
        <h2 className="section-title">
          Featured <span className="highlight">work</span>
        </h2>

        <div className="projects-grid">
          {projects.map((project, idx) => (
            <div
              key={project.title}
              className="project-card"
              style={{
                "--accent": project.color,
                transitionDelay: `${idx * 0.12}s`,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="project-header">
                <div className="project-icon">{project.icon}</div>
                <div className="project-number">
                  {String(idx + 1).padStart(2, "0")}
                </div>
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-link"
              >
                <span>View on GitHub</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <div className="project-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
