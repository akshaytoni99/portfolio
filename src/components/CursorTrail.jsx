import { useEffect, useRef } from "react";
import "./CursorTrail.css";

const COLORS = ["168, 85, 247", "236, 72, 153", "236, 72, 153", "192, 132, 252"];
const MAX_PARTICLES = 60;
const LIFE_DECAY = 0.015;
const GRAVITY = 0.01;
const AI_SYMBOLS = ["0", "1", "0", "1", "<", ">", "{", "}", "λ", "Σ", "∞", "AI", "ML", "⟨", "⟩", "/", "*", "θ", "∂", "∇"];

function CursorTrail() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticles = (x, y) => {
      const count = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.3,
          life: 1.0,
          size: 8 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          char: AI_SYMBOLS[Math.floor(Math.random() * AI_SYMBOLS.length)],
          rotation: (Math.random() - 0.5) * 0.6,
          rotSpeed: (Math.random() - 0.5) * 0.03,
        });
      }

      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current.splice(
          0,
          particlesRef.current.length - MAX_PARTICLES
        );
      }
    };

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      frameCount.current++;
      if (frameCount.current % 2 === 0) {
        spawnParticles(e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.life -= LIFE_DECAY;
        p.rotation += p.rotSpeed;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.7;
        const color = `rgba(${p.color}, ${alpha})`;
        const fontSize = p.size * p.life;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${fontSize < 6 ? 6 : fontSize}px monospace`;
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, ${alpha * 0.8})`;
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" />;
}

export default CursorTrail;
