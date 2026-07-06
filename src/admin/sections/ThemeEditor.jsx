import { useEffect, useRef } from "react";

const emptyDraft = () => ({
  primary: "#6366f1",
  accent: "#38bdf8",
  background: "#030712",
  animationsEnabled: true,
});

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function ColorField({ label, value, onChange }) {
  const valid = HEX_RE.test(value || "");
  return (
    <div className="adm-field" style={{ marginBottom: 14 }}>
      <label className="adm-label" style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 44, height: 32, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
        />
        <input
          className="adm-input"
          style={{ width: 110 }}
          value={value || ""}
          placeholder="#6366f1"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function ThemeEditor({ draft, onChange }) {
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const setField = (key, val) => onChange({ ...data, [key]: val });
  const safe = (hex, fallback) => (HEX_RE.test(hex || "") ? hex : fallback);

  const primary = safe(data.primary, "#6366f1");
  const accent = safe(data.accent, "#38bdf8");
  const background = safe(data.background, "#030712");

  return (
    <div>
      <ColorField label="Primary color" value={data.primary} onChange={(v) => setField("primary", v)} />
      <ColorField label="Accent color" value={data.accent} onChange={(v) => setField("accent", v)} />
      <ColorField label="Background color" value={data.background} onChange={(v) => setField("background", v)} />

      <div className="adm-field" style={{ marginBottom: 14 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!data.animationsEnabled}
            onChange={(e) => setField("animationsEnabled", e.target.checked)}
          />
          <span className="adm-label">Animations enabled</span>
        </label>
      </div>

      <div className="adm-field" style={{ marginBottom: 14 }}>
        <label className="adm-label" style={{ display: "block", marginBottom: 6 }}>
          Live preview
        </label>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            padding: 16,
            borderRadius: 12,
            background: background,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {[
            ["Primary", primary],
            ["Accent", accent],
            ["Background", background],
          ].map(([name, color]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: color,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{name}</span>
            </div>
          ))}
          <button
            type="button"
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: primary,
              color: "#fff",
              fontSize: 13,
              cursor: "default",
            }}
          >
            Button
          </button>
          <span style={{ color: accent, fontSize: 14 }}>Accent text</span>
        </div>
      </div>
    </div>
  );
}
