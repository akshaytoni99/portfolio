import { useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./TechStack.css";

// Skill icons starting with "/" are logo file paths (e.g. /logos/python.svg);
// anything else renders as the letter abbreviation, matching the original markup.
function ToolIcon({ tool, color }) {
  const logo =
    tool.logo ??
    (typeof tool.icon === "string" && tool.icon.startsWith("/") ? tool.icon : null);
  if (logo) {
    return <img src={logo} alt={tool.name} className="tool-logo" />;
  }
  return (
    <span className="tool-letter" style={{ color }}>
      {tool.icon}
    </span>
  );
}

export default function TechStack() {
  const [ref, visible] = useScrollReveal(0.1);
  const techCategories = useContent("skills").categories ?? [];

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
              key={cat.id ?? cat.name}
              className="tech-category"
              style={{
                "--accent": cat.color ?? "#6366f1",
                animationDelay: `${catIdx * 0.12}s`,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <h3 className="tech-category-title">{cat.name}</h3>
              <div className="tech-tools">
                {(cat.skills ?? []).map((tool) => (
                  <div key={tool.name} className="tech-tool">
                    <div className="tool-icon-wrapper">
                      <ToolIcon tool={tool} color={cat.color ?? "#6366f1"} />
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
