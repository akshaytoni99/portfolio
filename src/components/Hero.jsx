import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { useContent } from "../content/ContentContext";
import "./Hero.css";

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
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-linked parallax: progress 0 = hero top at viewport top, 1 = hero bottom at viewport top.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const innerY = useTransform(scrollYProgress, [0, 0.6], [0, 110]);
  const innerOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0, 0.7], [0, 60]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  // React does not reliably render the muted attribute (facebook/react#10389);
  // browsers block unmuted autoplay, so force muted before playing.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  // Freeze on a closed-mouth smiling frame instead of the mid-speech last frame.
  const handleVideoEnd = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 19.59;
  }, []);

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
    const role = roles[roleIdx % roles.length] ?? "";
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
  }, [text, deleting, roleIdx, roles]);

  return (
    <section id="home" className="hero" ref={heroRef}>
      <motion.video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
        disablePictureInPicture
        onEnded={handleVideoEnd}
        style={prefersReducedMotion ? undefined : { scale: videoScale }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </motion.video>
      <div className="hero-video-overlay" aria-hidden="true" />

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
          <motion.div className="hero-intro" variants={fadeUp}>
            <span className="hero-greeting">{hero.greeting}</span>
          </motion.div>

          <motion.h1 className="hero-name" variants={fadeUp}>
            {hero.name.split(" ").map((word, wi, words) => (
              <span key={wi} className="word">
                {word.split("").map((char, ci) => {
                  const globalIdx = words.slice(0, wi).join("").length + ci;
                  return (
                    <span key={ci} className="letter" style={{ animationDelay: `${0.6 + globalIdx * 0.05}s` }}>
                      {char}
                    </span>
                  );
                })}
                {wi < words.length - 1 && <span className="letter-space" />}
              </span>
            ))}
          </motion.h1>

          <motion.div className="hero-role" variants={fadeUp}>
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
        transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
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
        transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="scroll-line" />
        <span>Scroll</span>
      </motion.div>

      <motion.button
        className="hero-mute-btn"
        onClick={toggleMute}
        aria-label={muted ? "Unmute background video" : "Mute background video"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </motion.button>
    </section>
  );
}
