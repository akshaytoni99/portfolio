import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useContent } from "../content/ContentContext";
import "./Projects.css";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const railVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

// Fallback preview when a project has no image: GitHub's OpenGraph card.
function previewSrc(project) {
  if (project.image) return project.image;
  const match = /github\.com\/([^/]+\/[^/]+)/.exec(project.github ?? "");
  return match ? `https://opengraph.githubassets.com/1/${match[1]}` : "";
}

function ProjectCard({ project, idx }) {
  const reduceMotion = useReducedMotion();
  const src = previewSrc(project);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.article
      className="project-card"
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      style={{ "--accent": project.color ?? "#6366f1" }}
      onMouseMove={handleMouseMove}
    >
      <div className="project-media">
        <span className="project-badge">{String(idx + 1).padStart(2, "0")}</span>
        {src ? (
          <img
            src={src}
            alt={`${project.title} preview`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.classList.add("no-image");
            }}
          />
        ) : null}
        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            className="project-live-pill"
          >
            <span className="live-dot" />
            Live
          </a>
        ) : null}
      </div>

      <div className="project-body">
        <h3 className="project-title">{project.title}</h3>
        <p
          className="project-desc"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
        <div className="project-tags">
          {(project.tech ?? []).map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="project-links">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="project-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.11-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .3.2.67.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            <span>GitHub</span>
          </a>
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="project-link project-link-demo"
            >
              <span>Live Demo</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
      <div className="project-spotlight" />
    </motion.article>
  );
}

export default function Projects() {
  const [ref, visible] = useScrollReveal(0.1);
  const railRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const items = useContent("projects").items ?? [];
  const projects = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const updateArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanPrev(rail.scrollLeft > 8);
    setCanNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateArrows();
    rail.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      rail.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCards = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector(".project-card");
    const step = card ? card.offsetWidth + 24 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="projects" className="projects" ref={ref}>
      <div className={`projects-container ${visible ? "revealed" : ""}`}>
        <div className="projects-head">
          <div>
            <div className="section-tag">Projects</div>
            <h2 className="section-title">
              Featured <span className="highlight">work</span>
            </h2>
          </div>
          <div className="projects-arrows">
            <button
              type="button"
              className="rail-arrow"
              aria-label="Scroll projects left"
              onClick={() => scrollByCards(-1)}
              disabled={!canPrev}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="rail-arrow"
              aria-label="Scroll projects right"
              onClick={() => scrollByCards(1)}
              disabled={!canNext}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <motion.div
          className="projects-rail"
          ref={railRef}
          variants={railVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          tabIndex={0}
          aria-label="Projects carousel, scroll horizontally"
        >
          {projects.map((project, idx) => (
            <ProjectCard key={project.id ?? project.title} project={project} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
