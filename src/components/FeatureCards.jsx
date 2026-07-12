import { motion } from "framer-motion";
import { Bot, Database, Workflow } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./FeatureCards.css";

const CARDS = [
  {
    title: "LLM Applications",
    description:
      "I ship production LLM apps with LangChain — chatbots, summarizers and RAG assistants that turn language into working products.",
    icon: <Bot size={32} strokeWidth={2.5} />,
    gradient:
      "linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)",
    delay: 0.1,
  },
  {
    title: "RAG Systems",
    description:
      "Retrieval-augmented answers grounded in your documents — vector search, embeddings and zero-hallucination pipelines.",
    icon: <Database size={32} strokeWidth={2.5} />,
    gradient:
      "linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)",
    delay: 0.2,
  },
  {
    title: "Multi-Agent Systems",
    description:
      "Stateful multi-agent workflows with LangGraph — agents that plan, collaborate and automate real, repeatable work.",
    icon: <Workflow size={32} strokeWidth={2.5} />,
    gradient:
      "linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)",
    delay: 0.3,
  },
];

function FeatureCard({ title, description, icon, gradient, delay }) {
  return (
    <motion.div
      className="fcard"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      <div className="fcard-wrap group">
        {/* glow */}
        <div
          className="fcard-glow"
          style={{ background: gradient, filter: "blur(45px)" }}
        />
        {/* foreground card with gradient border via background-clip */}
        <div
          className="fcard-fg"
          style={{
            background: `linear-gradient(#1A1A1C, #1A1A1C) padding-box, ${gradient} border-box`,
          }}
        >
          <div className="fcard-inner">
            <div className="fcard-icon">{icon}</div>
            <div>
              <h3 className="fcard-title">{title}</h3>
              <p className="fcard-desc">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeatureCards() {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <section id="focus" className="feature-section" ref={ref}>
      <div className={`feature-head ${visible ? "revealed" : ""}`}>
        <div className="section-tag">What I build</div>
        <h2 className="section-title">
          Focus <span className="highlight">areas</span>
        </h2>
      </div>
      <div className="fcard-grid">
        {CARDS.map((c) => (
          <FeatureCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}
