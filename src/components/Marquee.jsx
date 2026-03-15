import "./Marquee.css";

const items = [
  "Generative AI", "LLM Engineering", "RAG Systems", "Multi-Agent",
  "LangChain", "Python", "PyTorch", "TensorFlow", "NLP",
  "Prompt Engineering", "Fine-Tuning", "Vector Databases",
  "Computer Vision", "Deep Learning", "Neural Networks"
];

export default function Marquee() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-text">{item}</span>
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
