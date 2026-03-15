import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./TechStack.css";

const techCategories = [
  {
    title: "Languages & Data",
    color: "#a855f7",
    tools: [
      { name: "Python", logo: "/logos/python.svg" },
      { name: "SQL", icon: "SQL" },
      { name: "Pandas", icon: "Pd" },
      { name: "NumPy", icon: "Np" },
      { name: "Git", icon: "Git" },
    ],
  },
  {
    title: "Machine Learning & Deep Learning",
    color: "#c084fc",
    tools: [
      { name: "Scikit-learn", icon: "Sk" },
      { name: "TensorFlow", logo: "/logos/tensorflow.svg" },
      { name: "PyTorch", logo: "/logos/pytorch.svg" },
      { name: "spaCy", icon: "sC" },
      { name: "Matplotlib", icon: "Mp" },
    ],
  },
  {
    title: "Generative AI & LLMs",
    color: "#f97316",
    tools: [
      { name: "GPT", logo: "/logos/openai.svg" },
      { name: "Claude", logo: "/logos/claude.svg" },
      { name: "Gemini", logo: "/logos/gemini.svg" },
      { name: "LLaMA", logo: "/logos/llama.svg" },
      { name: "Mistral", logo: "/logos/mistral.svg" },
    ],
  },
  {
    title: "AI Frameworks & Tools",
    color: "#ec4899",
    tools: [
      { name: "LangChain", logo: "/logos/langchain.svg" },
      { name: "LangGraph", logo: "/logos/langgraph.svg" },
      { name: "HF Transformers", logo: "/logos/huggingface.svg" },
      { name: "Groq", logo: "/logos/groq.svg" },
      { name: "Streamlit", logo: "/logos/streamlit.svg" },
    ],
  },
  {
    title: "Retrieval & AI Systems",
    color: "#fb923c",
    tools: [
      { name: "RAG", icon: "RAG" },
      { name: "FAISS", icon: "F" },
      { name: "ChromaDB", icon: "C" },
      { name: "AstraDB", icon: "A" },
      { name: "Embeddings", icon: "E" },
      { name: "Multi-Agent", icon: "MA" },
    ],
  },
];

function ToolIcon({ tool, color }) {
  if (tool.logo) {
    return <img src={tool.logo} alt={tool.name} className="tool-logo" />;
  }
  return (
    <span className="tool-letter" style={{ color }}>
      {tool.icon}
    </span>
  );
}

export default function TechStack() {
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
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  return (
    <section id="techstack" className="techstack" ref={ref}>
      <div className={`techstack-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Tech Stack</div>
        <h2 className="section-title">
          Tools I <span className="highlight">work with</span>
        </h2>

        <div className="techstack-grid">
          {techCategories.map((cat, catIdx) => (
            <div
              key={cat.title}
              className="tech-category"
              style={{
                "--accent": cat.color,
                animationDelay: `${catIdx * 0.12}s`,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <h3 className="tech-category-title">{cat.title}</h3>
              <div className="tech-tools">
                {cat.tools.map((tool) => (
                  <div key={tool.name} className="tech-tool">
                    <div className="tool-icon-wrapper">
                      <ToolIcon tool={tool} color={cat.color} />
                    </div>
                    <span className="tool-name">{tool.name}</span>
                  </div>
                ))}
              </div>
              <div className="tech-category-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
