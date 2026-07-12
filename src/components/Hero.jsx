import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { useContent } from "../content/ContentContext";
import "./Hero.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const hero = useContent("hero");
  const about = useContent("about");
  const resume = useContent("resume");
  const roles = hero.roles;
  const stats = about.stats;
  const [btnPrimary, btnContact, btnResume] = hero.buttons;
  const [roleIdx, setRoleIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [statsRef1, count1] = useCountUp(stats[0]?.value ?? 0);
  const [statsRef2, count2] = useCountUp(stats[1]?.value ?? 0);
  const [statsRef3, count3] = useCountUp(stats[2]?.value ?? 0);
  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-linked parallax on the hero content.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const innerY = useTransform(scrollYProgress, [0, 0.6], [0, 90]);
  const innerOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0, 0.7], [0, 55]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  // Cursor parallax for the aurora blobs.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
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
    const role = roles[roleIdx % roles.length] ?? "";
    let timeout;
    if (!deleting) {
      if (text.length < role.length) {
        timeout = setTimeout(() => setText(role.slice(0, text.length + 1)), 75);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 38);
      } else {
        setDeleting(false);
        setRoleIdx((prev) => (prev + 1) % roles.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, roleIdx, roles]);

  return (
    <section id="home" className="hero" ref={heroRef}>
      {/* ── Premium AI backdrop ── */}
      <motion.div
        className="hero-aurora"
        aria-hidden="true"
        style={prefersReducedMotion ? undefined : { y: auroraY }}
      >
        <span className="aurora-blob aurora-1" />
        <span className="aurora-blob aurora-2" />
        <span className="aurora-blob aurora-3" />
      </motion.div>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <motion.div
        className="hero-inner"
        style={prefersReducedMotion ? undefined : { y: innerY, opacity: innerOpacity }}
      >
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={fadeUp}>
            <span className="hero-badge-dot" />
            Available for Generative AI / ML roles
          </motion.div>

          <motion.div className="hero-intro" variants={fadeUp}>
            <span className="hero-greeting">{hero.greeting}</span>
          </motion.div>

          <motion.h1 className="hero-name" variants={fadeUp}>
            {hero.name.split(" ").map((word, wi, words) => (
              <span key={wi} className="word">
                {word.split("").map((char, ci) => {
                  const globalIdx = words.slice(0, wi).join("").length + ci;
                  return (
                    <span key={ci} className="letter" style={{ animationDelay: `${0.5 + globalIdx * 0.045}s` }}>
                      {char}
                    </span>
                  );
                })}
                {wi < words.length - 1 && <span className="letter-space" />}
              </span>
            ))}
          </motion.h1>

          <motion.div className="hero-role" variants={fadeUp}>
            <span className="role-pre">Building as a</span>{" "}
            <span className="role-text">{text}</span>
            <span className="role-cursor">|</span>
          </motion.div>

          <motion.p className="hero-desc" variants={fadeUp}>
            {hero.description}
          </motion.p>

          <motion.div className="hero-buttons" variants={fadeUp}>
            <a href={btnPrimary?.href ?? "#projects"} className="btn-primary" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>
              <span>{btnPrimary?.label ?? "View My Work"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href={btnContact?.href ?? "#contact"} className="btn-outline" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>{btnContact?.label ?? "Get in Touch"}</a>
            <a href={resume?.url || hero.resumeUrl} download className="btn-outline" onMouseMove={handleMagnet} onMouseLeave={handleMagnetLeave}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {btnResume?.label ?? "Resume"}
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="hero-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={prefersReducedMotion ? undefined : { y: statsY }}
      >
        <div className="stat" ref={statsRef1}>
          <span className="stat-number">{count1}{stats[0]?.suffix ?? "+"}</span>
          <span className="stat-label">{stats[0]?.label}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat" ref={statsRef2}>
          <span className="stat-number">{count2}{stats[1]?.suffix ?? "+"}</span>
          <span className="stat-label">{stats[1]?.label}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat" ref={statsRef3}>
          <span className="stat-number">{count3}{stats[2]?.suffix ?? "+"}</span>
          <span className="stat-label">{stats[2]?.label}</span>
        </div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="scroll-line" />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
}
