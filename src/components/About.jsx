import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./About.css";

export default function About() {
  const [ref, visible] = useScrollReveal(0.2);
  const about = useContent("about");

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
          {about.paragraphs.map((paragraph, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </div>
    </section>
  );
}
