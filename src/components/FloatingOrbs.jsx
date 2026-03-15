import "./FloatingOrbs.css";

const orbs = [
  { size: 300, x: "10%", y: "20%", color: "#7c3aed", delay: 0, duration: 20 },
  { size: 200, x: "80%", y: "15%", color: "#ec4899", delay: 5, duration: 25 },
  { size: 250, x: "70%", y: "60%", color: "#f97316", delay: 10, duration: 22 },
  { size: 180, x: "20%", y: "70%", color: "#a855f7", delay: 8, duration: 28 },
  { size: 150, x: "50%", y: "40%", color: "#6d28d9", delay: 3, duration: 18 },
];

export default function FloatingOrbs() {
  return (
    <div className="floating-orbs">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="floating-orb"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            "--orb-color": orb.color,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
