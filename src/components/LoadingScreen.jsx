import { useState, useEffect } from "react";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setHidden(true), 400);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  if (hidden) return null;

  return (
    <div className={`loading-screen ${progress >= 100 ? "fade-out" : ""}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <span className="loading-bracket">&lt;</span>
          <span className="loading-name">AK</span>
          <span className="loading-bracket">/&gt;</span>
        </div>
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="loading-text">
          {progress < 100 ? "Initializing AI Systems..." : "Ready"}
        </div>
      </div>
      <div className="loading-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="loading-particle"
            style={{
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 100}%`,
              "--d": `${Math.random() * 3 + 1}s`,
              "--s": `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
