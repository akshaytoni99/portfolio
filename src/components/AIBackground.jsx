import { useEffect, useRef } from "react";
import "./AIBackground.css";

/*
  Advanced Floating Binary Embers Background
  ─ Cinematic drifting 0/1 + tech symbols like glowing embers
  ─ Neural connection lines between nearby particles
  ─ Mouse repulsion zone (particles flee cursor)
  ─ Click shockwave burst
  ─ Data stream columns (Matrix-inspired)
  ─ Motion trails with fade
  ─ Depth layers, glow, parallax
*/

const BINARY_COUNT = 90;
const EMBER_COUNT = 60;
const CONNECTION_DIST = 120;
const MOUSE_RADIUS = 150;

// Simple pseudo-noise for organic movement
const noise = (x, y, t) =>
  Math.sin(x * 0.01 + t) * Math.cos(y * 0.012 + t * 0.7) * 0.5 +
  Math.sin(x * 0.008 - t * 0.5) * Math.cos(y * 0.006 + t * 1.1) * 0.5;

export default function AIBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, dpr;
    let animId;
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };
    const shockwaves = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Color palette
    const colors = [
      { r: 124, g: 58, b: 237 },
      { r: 168, g: 85, b: 247 },
      { r: 236, g: 72, b: 153 },
      { r: 249, g: 115, b: 22 },
      { r: 109, g: 40, b: 217 },
      { r: 192, g: 132, b: 252 },
    ];

    const techChars = ["0", "1", "0", "1", "0", "1", "<", ">", "{", "}", "/", "*", "#", "λ", "Σ", "∞", "⟨", "⟩"];

    // ── Binary / tech digits ──
    const binaries = [];
    for (let i = 0; i < BINARY_COUNT; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      const color = colors[Math.floor(Math.random() * colors.length)];
      binaries.push({
        char: techChars[Math.floor(Math.random() * techChars.length)],
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.15 + Math.random() * 0.5),
        depth,
        size: 10 + depth * 16,
        baseOpacity: 0.08 + depth * 0.35,
        glow: depth > 0.7 ? 8 + depth * 12 : 0,
        color,
        rotation: (Math.random() - 0.5) * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.3 + Math.random() * 0.5,
        swayAmp: 0.2 + Math.random() * 0.5,
        flickerPhase: Math.random() * Math.PI * 2,
        // For connection lines
        screenX: 0,
        screenY: 0,
      });
    }

    // ── Ember dots ──
    const embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      const depth = 0.2 + Math.random() * 0.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.1 + Math.random() * 0.6),
        radius: 0.8 + depth * 2.5,
        depth,
        baseOpacity: 0.15 + depth * 0.5,
        glow: depth > 0.5 ? 4 + depth * 8 : 0,
        color,
        flickerPhase: Math.random() * Math.PI * 2,
        trail: [],
        screenX: 0,
        screenY: 0,
      });
    }

    // ── Events ──
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    const onClick = (e) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 250,
        speed: 6,
        opacity: 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);

    // ── Main loop ──
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse
      if (mouse.active) {
        mouse.sx += (mouse.x - mouse.sx) * 0.08;
        mouse.sy += (mouse.y - mouse.sy) * 0.08;
      }

      // Parallax from mouse center
      const px = mouse.active ? (mouse.sx / width - 0.5) * 2 : 0;
      const py = mouse.active ? (mouse.sy / height - 0.5) * 2 : 0;

      // ── Shockwaves ──
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.opacity *= 0.97;
        if (sw.opacity < 0.01 || sw.radius > sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${sw.color.r}, ${sw.color.g}, ${sw.color.b}, ${sw.opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${sw.color.r}, ${sw.color.g}, ${sw.color.b}, ${sw.opacity * 0.5})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── Ember dots with trails ──
      for (const e of embers) {
        const flicker = 0.7 + Math.sin(t * 3 + e.flickerPhase) * 0.3;
        const alpha = e.baseOpacity * flicker;

        const ox = px * e.depth * 15;
        const oy = py * e.depth * 10;
        const n = noise(e.x, e.y, t) * e.depth * 0.5;

        let ex = e.x + ox;
        let ey = e.y + oy;

        // Mouse repulsion
        if (mouse.active) {
          const dx = ex - mouse.sx;
          const dy = ey - mouse.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * 3;
            e.x += (dx / dist) * force;
            e.y += (dy / dist) * force;
          }
        }

        // Shockwave push
        for (const sw of shockwaves) {
          const dx = e.x - sw.x;
          const dy = e.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - sw.radius) < 30 && dist > 0) {
            const force = sw.opacity * 4;
            e.x += (dx / dist) * force;
            e.y += (dy / dist) * force;
          }
        }

        ex = e.x + ox;
        ey = e.y + oy;
        e.screenX = ex;
        e.screenY = ey;

        // Draw trail
        e.trail.push({ x: ex, y: ey, a: alpha });
        if (e.trail.length > 6) e.trail.shift();
        for (let ti = 0; ti < e.trail.length - 1; ti++) {
          const tp = e.trail[ti];
          const trailAlpha = tp.a * (ti / e.trail.length) * 0.3;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, e.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${trailAlpha})`;
          ctx.fill();
        }

        // Main dot
        if (e.glow > 0) {
          ctx.shadowBlur = e.glow * flicker;
          ctx.shadowColor = `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(ex, ey, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Move
        e.x += e.vx + n * 0.3;
        e.y += e.vy;

        // Wrap
        if (e.y < -20) { e.y = height + 20; e.x = Math.random() * width; e.trail = []; }
        if (e.x < -20) { e.x = width + 20; e.trail = []; }
        if (e.x > width + 20) { e.x = -20; e.trail = []; }
      }

      // ── Binary digits ──
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const b of binaries) {
        const sway = Math.sin(t * b.swaySpeed + b.swayPhase) * b.swayAmp;
        const flicker = 0.6 + Math.sin(t * 2 + b.flickerPhase) * 0.4;
        const alpha = b.baseOpacity * flicker;
        const n = noise(b.x, b.y, t * 0.8) * b.depth;

        const ox = px * b.depth * 20;
        const oy = py * b.depth * 12;

        let bx = b.x + sway + ox;
        let by = b.y + oy;

        // Mouse repulsion
        if (mouse.active) {
          const dx = bx - mouse.sx;
          const dy = by - mouse.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * 5;
            b.x += (dx / dist) * force;
            b.y += (dy / dist) * force;
          }
        }

        // Shockwave push
        for (const sw of shockwaves) {
          const dx = b.x - sw.x;
          const dy = b.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - sw.radius) < 40 && dist > 0) {
            const force = sw.opacity * 6;
            b.x += (dx / dist) * force;
            b.y += (dy / dist) * force;
          }
        }

        bx = b.x + sway + ox;
        by = b.y + oy;
        b.screenX = bx;
        b.screenY = by;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(b.rotation);

        if (b.glow > 0) {
          ctx.shadowBlur = b.glow * flicker;
          ctx.shadowColor = `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${alpha * 0.8})`;
        }

        ctx.font = `${b.depth > 0.7 ? 700 : 400} ${b.size}px monospace`;
        ctx.fillStyle = `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${alpha})`;
        ctx.fillText(b.char, 0, 0);

        ctx.shadowBlur = 0;
        ctx.restore();

        // Move
        b.x += b.vx + sway * 0.02 + n * 0.2;
        b.y += b.vy;
        b.rotation += b.rotSpeed;

        // Wrap
        if (b.y < -40) {
          b.y = height + 40;
          b.x = Math.random() * width;
          b.char = techChars[Math.floor(Math.random() * techChars.length)];
        }
        if (b.x < -40) b.x = width + 40;
        if (b.x > width + 40) b.x = -40;
      }

      // ── Connection lines between nearby particles ──
      const allPoints = [];
      for (const b of binaries) {
        if (b.depth > 0.5) allPoints.push(b);
      }
      for (const e of embers) {
        if (e.depth > 0.5) allPoints.push(e);
      }

      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
          const a = allPoints[i];
          const b = allPoints[j];
          const dx = a.screenX - b.screenX;
          const dy = a.screenY - b.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.12;
            const avgColor = {
              r: (a.color.r + b.color.r) >> 1,
              g: (a.color.g + b.color.g) >> 1,
              b: (a.color.b + b.color.b) >> 1,
            };
            ctx.beginPath();
            ctx.moveTo(a.screenX, a.screenY);
            ctx.lineTo(b.screenX, b.screenY);
            ctx.strokeStyle = `rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="ai-background">
      <canvas ref={canvasRef} />
    </div>
  );
}
