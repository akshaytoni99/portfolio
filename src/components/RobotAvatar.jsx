import "./RobotAvatar.css";

/**
 * Friendly 3D-style robot mascot rendered as layered-gradient SVG (no WebGL,
 * keeps the bundle light). Animates by `state`:
 *   - "idle"     gentle float + periodic blink
 *   - "thinking" eyes glance up, antennae pulse, glow ring
 *   - "talking"  mouth animates while streaming
 */
export default function RobotAvatar({ size = 40, state = "idle", className = "" }) {
  // Unique gradient ids so multiple instances on one page don't collide.
  const uid = `rb${size}`;
  return (
    <span
      className={`robot robot--${state} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 116" width={size} height={size} className="robot-svg">
        <defs>
          <radialGradient id={`${uid}-body`} cx="38%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="62%" stopColor="#f3f5fb" />
            <stop offset="100%" stopColor="#d7ddec" />
          </radialGradient>
          <linearGradient id={`${uid}-face`} x1="20%" y1="10%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#7c80f0" />
            <stop offset="55%" stopColor="#5b58e6" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <radialGradient id={`${uid}-ball`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e9e2ff" />
            <stop offset="45%" stopColor="#b39dff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </radialGradient>
          <radialGradient id={`${uid}-ear`} cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#d5e8ff" />
            <stop offset="55%" stopColor="#8ec5ff" />
            <stop offset="100%" stopColor="#5aa9f0" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* thinking glow ring */}
        <circle className="robot-glow" cx="60" cy="64" r="52" fill={`url(#${uid}-glow)`} />

        {/* antennae */}
        <g className="robot-antennae">
          <rect x="41.5" y="18" width="4" height="22" rx="2" fill="#c9d0e6" transform="rotate(-8 43 30)" />
          <rect x="74.5" y="18" width="4" height="22" rx="2" fill="#c9d0e6" transform="rotate(8 77 30)" />
          <circle className="robot-ball" cx="38" cy="16" r="9.5" fill={`url(#${uid}-ball)`} />
          <circle className="robot-ball" cx="82" cy="16" r="9.5" fill={`url(#${uid}-ball)`} />
          <circle cx="35" cy="13" r="2.6" fill="#ffffff" opacity="0.85" />
          <circle cx="79" cy="13" r="2.6" fill="#ffffff" opacity="0.85" />
        </g>

        {/* headphone ears */}
        <g className="robot-ears">
          <rect x="6" y="52" width="20" height="34" rx="10" fill={`url(#${uid}-ear)`} />
          <rect x="94" y="52" width="20" height="34" rx="10" fill={`url(#${uid}-ear)`} />
          <circle cx="16" cy="69" r="6" fill="#eaf4ff" opacity="0.9" />
          <circle cx="104" cy="69" r="6" fill="#eaf4ff" opacity="0.9" />
        </g>

        {/* head / body */}
        <rect x="16" y="30" width="88" height="76" rx="27" fill={`url(#${uid}-body)`} />
        <rect
          x="16" y="30" width="88" height="76" rx="27"
          fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5"
        />

        {/* face screen */}
        <rect x="30" y="43" width="60" height="50" rx="18" fill={`url(#${uid}-face)`} />
        {/* screen gloss */}
        <path
          d="M34 52 Q40 45 60 45 Q80 45 86 52 Q70 51 60 51 Q50 51 34 52 Z"
          fill="#ffffff" opacity="0.12"
        />

        {/* eyes */}
        <g className="robot-eyes">
          <ellipse className="robot-eye" cx="49" cy="66" rx="5.4" ry="6.6" fill="#ffffff" />
          <ellipse className="robot-eye" cx="71" cy="66" rx="5.4" ry="6.6" fill="#ffffff" />
        </g>

        {/* mouth */}
        <path
          className="robot-mouth"
          d="M52 78 Q60 85 68 78"
          fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round"
        />

        {/* body sheen */}
        <ellipse cx="46" cy="42" rx="20" ry="7" fill="#ffffff" opacity="0.35" />
      </svg>
    </span>
  );
}
