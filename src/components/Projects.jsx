import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./Projects.css";

// Icons stay in-component (JSX cannot live in JSON content); keyed by seed id,
// with a generic fallback for projects added through the admin.
const projectIcons = {
  "proj-langgraph-agents": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M8.5 7.5l3 5m4-5l-3 5" />
    </svg>
  ),
  "proj-pdf-rag": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="11" cy="15" r="3" />
      <line x1="21" y1="21" x2="13.5" y2="17.5" />
    </svg>
  ),
  "proj-insightstream": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  "proj-web-miner": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  "proj-sql-chatbot": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 10h8M8 14h4" />
    </svg>
  ),
  "proj-hate-speech": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const defaultProjectIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <path d="M8.5 7.5l3 5m4-5l-3 5" />
  </svg>
);

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const TILT_SPRING = { stiffness: 220, damping: 18 };
const MAX_TILT = 7;

function ProjectCard({ project, idx }) {
  const reduceMotion = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, TILT_SPRING);
  const rotateY = useSpring(tiltY, TILT_SPRING);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Cursor spotlight + existing glow vars
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);

    if (reduceMotion) return;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    tiltX.set(((y - centerY) / centerY) * -MAX_TILT);
    tiltY.set(((x - centerX) / centerX) * MAX_TILT);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      className="project-card"
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
      style={{
        "--accent": project.color ?? "#6366f1",
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-header">
        <div className="project-icon">{projectIcons[project.id] ?? defaultProjectIcon}</div>
        <div className="project-number">
          {String(idx + 1).padStart(2, "0")}
        </div>
      </div>
      <h3 className="project-title">{project.title}</h3>
      <p className="project-desc" dangerouslySetInnerHTML={{ __html: project.description }} />
      <div className="project-tags">
        {(project.tech ?? []).map((tag) => (
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
    </motion.div>
  );
}

export default function Projects() {
  const [ref, visible] = useScrollReveal(0.1);
  const items = useContent("projects").items ?? [];
  const projects = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section id="projects" className="projects" ref={ref}>
      <div className={`projects-container ${visible ? "revealed" : ""}`}>
        <div className="section-tag">Projects</div>
        <h2 className="section-title">
          Featured <span className="highlight">work</span>
        </h2>

        <motion.div
          className="projects-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {projects.map((project, idx) => (
            <ProjectCard key={project.id ?? project.title} project={project} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
