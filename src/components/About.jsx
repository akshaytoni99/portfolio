import { useScrollReveal } from "../hooks/useScrollReveal";
import "./About.css";

export default function About() {
  const [ref, visible] = useScrollReveal(0.2);

  return (
    <section id="about" className="about" ref={ref}>
      <div className={`about-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">About Me</div>
        <h2 className="section-title">
          Passionate about building
          <br />
          <span className="highlight">intelligent systems</span>
        </h2>

        <div className="about-text">
          <p>
            I am a Generative AI Engineer with a strong background in building
            intelligent systems powered by Large Language Models (LLMs), natural
            language processing, and machine learning. I specialize in designing
            AI-driven solutions that automate complex workflows, process large
            volumes of unstructured data, and transform information into
            structured, actionable insights.
          </p>
          <p>
            My work focuses on developing scalable AI pipelines and real-world
            LLM applications using tools such as LangChain, LangGraph, Hugging
            Face, and modern AI infrastructure. I have hands-on experience
            building multi-agent AI systems, retrieval-augmented generation
            (RAG) pipelines, and intelligent document processing solutions that
            enable efficient information extraction from complex documents.
          </p>
          <p>
            I am particularly interested in solving challenging problems
            involving document understanding, knowledge retrieval, and
            AI-powered automation. My goal is to create reliable and
            production-ready AI systems that improve extraction accuracy, reduce
            hallucinations in LLM outputs, and deliver meaningful value through
            data-driven intelligence.
          </p>
          <p>
            With experience across generative AI frameworks, vector databases,
            machine learning models, and modern LLM ecosystems, I enjoy
            exploring new advancements in AI and continuously improving
            intelligent systems that bridge the gap between research and
            real-world applications.
          </p>
        </div>
      </div>
    </section>
  );
}
