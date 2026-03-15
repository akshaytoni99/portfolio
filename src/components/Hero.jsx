import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import "./Hero.css";

const roles = [
  "Generative AI Engineer",
  "LLM Engineer",
  "AI Systems Engineer",
  "Machine Learning Engineer",
];

const orbitNodes = [
  // Ring 1 — LLMs (4 nodes, 90° apart)
  { label: "GPT", color: "#10a37f", ring: 1, angle: 0, logo: "/logos/openai.svg" },
  { label: "Claude", color: "#d4a27a", ring: 1, angle: 90, logo: "/logos/claude.svg" },
  { label: "Gemini", color: "#4285f4", ring: 1, angle: 180, logo: "/logos/gemini.svg" },
  { label: "LLaMA", color: "#0668E1", ring: 1, angle: 270, logo: "/logos/llama.svg" },
  // Ring 2 — Frameworks (5 nodes, 72° apart, offset 36°)
  { label: "LangChain", color: "#c084fc", ring: 2, angle: 36, logo: "/logos/langchain.svg" },
  { label: "HuggingFace", color: "#ffd21e", ring: 2, angle: 108, logo: "/logos/huggingface.svg" },
  { label: "Python", color: "#3776ab", ring: 2, angle: 180, logo: "/logos/python.svg" },
  { label: "PyTorch", color: "#ee4c2c", ring: 2, angle: 252, logo: "/logos/pytorch.svg" },
  { label: "TensorFlow", color: "#ff6f00", ring: 2, angle: 324, logo: "/logos/tensorflow.svg" },
];

const ringRadius = { 1: 170, 2: 220 };
const svgCenter = 250;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [statsRef1, count1] = useCountUp(12);
  const [statsRef2, count2] = useCountUp(8);
  const [statsRef3, count3] = useCountUp(4);
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleParallax = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--parallax-x", x.toFixed(3));
      hero.style.setProperty("--parallax-y", y.toFixed(3));
    };
    hero.addEventListener("mousemove", handleParallax);
    return () => hero.removeEventListener("mousemove", handleParallax);
  }, []);

  const handleMagnet = useCallback((e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = 100;
    if (dist < maxDist) {
      const strength = (1 - dist / maxDist) * 6;
      btn.style.transform = `translate(${(x / dist) * strength}px, ${(y / dist) * strength}px)`;
    }
  }, []);

  const handleMagnetLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  useEffect(() => {
    const role = roles[roleIdx];
    let timeout;
    if (!deleting) {
      if (text.length < role.length) {
        timeout = setTimeout(() => setText(role.slice(0, text.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 40);
      } else {
        setDeleting(false);
        setRoleIdx((prev) => (prev + 1) % roles.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, roleIdx]);

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero-inner">
        {/* Left: Text */}
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-intro" variants={fadeUp}>
            <span className="hero-greeting">Hello, I'm</span>
          </motion.div>

          <motion.h1 className="hero-name" variants={fadeUp}>
            {"Akshay Kumar".split("").map((char, i) =>
              char === " " ? (
                <span key={i} className="letter-space" />
              ) : (
                <span key={i} className="letter" style={{ animationDelay: `${0.6 + i * 0.05}s` }}>
                  {char}
                </span>
              )
            )}
          </motion.h1>

          <motion.div className="hero-role" variants={fadeUp}>
            <span className="role-text">{text}</span>
            <span className="role-cursor">|</span>
          </motion.div>

          <motion.p className="hero-desc" variants={fadeUp}>
            Generative AI Engineer skilled in building LLM-powered
            applications, multi-agent systems, and scalable AI pipelines
            that turn complex data into actionable insights.
          </motion.p>

          <motion.div className="hero-buttons" variants={fadeUp}>
            <a href="#projects" className="btn-primary" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>
              <span>View My Work</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#contact" className="btn-outline" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>Get in Touch</a>
            <a href="/Akshay_BTech_AI_DS_Resume.pdf" download className="btn-outline" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Resume
            </a>
          </motion.div>
        </motion.div>

        {/* Right: 3D Photo + Orbiting Logos */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow blobs */}
          <div className="hero-photo-glow" />
          <div className="hero-photo-glow-2" />

          {/* SVG orbit rings */}
          <svg className="orbit-svg" viewBox="0 0 500 500">
            <circle cx={svgCenter} cy={svgCenter} r={ringRadius[1]} className="orbit-ring ring-1" />
            <circle cx={svgCenter} cy={svgCenter} r={ringRadius[2]} className="orbit-ring ring-2" />
            {/* Connection lines */}
            {orbitNodes.map((node, i) => {
              const r = ringRadius[node.ring];
              const rad = (node.angle * Math.PI) / 180;
              const nx = svgCenter + r * Math.cos(rad);
              const ny = svgCenter + r * Math.sin(rad);
              return (
                <line
                  key={`line-${i}`}
                  x1={svgCenter} y1={svgCenter}
                  x2={nx} y2={ny}
                  className="orbit-line"
                  style={{ "--line-color": node.color }}
                />
              );
            })}
          </svg>

          {/* 3D Profile photo */}
          <div className="hero-photo-frame">
            <img src="/profile.png" alt="Akshay Kumar" className="hero-photo" />
            <div className="hero-photo-border" />
            <div className="hero-photo-shine" />
            <div className="hero-photo-rim" />
          </div>

          {/* Orbiting logo nodes */}
          {orbitNodes.map((node, i) => (
            <div
              key={i}
              className={`orbit-container orbit-r-${node.ring}`}
              style={{ "--start-angle": `${node.angle}deg` }}
            >
              <motion.div
                className="orbit-node"
                style={{
                  "--node-color": node.color,
                  "--orbit-r": `${ringRadius[node.ring]}px`,
                }}
                whileHover={{ scale: 1.25 }}
              >
                <img src={node.logo} alt={node.label} className="orbit-node-logo" />
              </motion.div>
            </div>
          ))}

          {/* Lightning bolts */}
          <motion.svg
            className="hero-bolt bolt-1"
            width="28" height="60" viewBox="0 0 28 60" fill="none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <path d="M16 2L4 28h10L8 58l18-32H14L22 2H16z" fill="url(#boltG1)" />
            <defs>
              <linearGradient id="boltG1" x1="12" y1="2" x2="12" y2="58" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" /><stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </motion.svg>
          <motion.svg
            className="hero-bolt bolt-2"
            width="20" height="42" viewBox="0 0 20 42" fill="none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <path d="M12 1L3 20h7L6 41l13-23H10L16 1H12z" fill="url(#boltG2)" />
            <defs>
              <linearGradient id="boltG2" x1="9" y1="1" x2="9" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" /><stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </motion.svg>
          <motion.svg
            className="hero-bolt bolt-3"
            width="16" height="34" viewBox="0 0 16 34" fill="none"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.6 }}
          >
            <path d="M9 1L2 16h5L4 33l10-18H8L12 1H9z" fill="url(#boltG3)" />
            <defs>
              <linearGradient id="boltG3" x1="7" y1="1" x2="7" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" /><stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </motion.svg>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="hero-stats"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="stat" ref={statsRef1}>
          <span className="stat-number">{count1}+</span>
          <span className="stat-label">AI Projects</span>
        </div>
        <div className="stat-divider" />
        <div className="stat" ref={statsRef2}>
          <span className="stat-number">{count2}+</span>
          <span className="stat-label">LLM Systems</span>
        </div>
        <div className="stat-divider" />
        <div className="stat" ref={statsRef3}>
          <span className="stat-number">{count3}+</span>
          <span className="stat-label">RAG / Agent Systems</span>
        </div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="scroll-line" />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
}
