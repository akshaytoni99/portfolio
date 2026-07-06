import { useEffect, useRef } from "react";
import MediaPicker from "../components/MediaPicker";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ items: [] });

const newItem = () => ({
  id: crypto.randomUUID(),
  title: "",
  issuer: "",
  date: "",
  image: "",
  credentialUrl: "",
  color: "#6366f1",
});

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function Field({ label, children }) {
  return (
    <div className="adm-field" style={{ marginBottom: 14 }}>
      <label className="adm-label" style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CertificationsEditor({ draft, onChange }) {
  const confirm = useConfirm();
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const items = data.items || [];

  const commitItems = (next) => onChange({ ...data, items: next });
  const updateItem = (i, patch) => commitItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const removeItem = async (i) => {
    const title = items[i]?.title || "this certification";
    if (await confirm(`Delete "${title}"?`)) {
      commitItems(items.filter((_, j) => j !== i));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => commitItems([...items, newItem()])}>
          Add certification
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No certifications yet.</div>
      ) : null}

      {items.map((item, i) => (
        <div key={item.id} className="adm-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 14 }}>{item.title || "Untitled certification"}</span>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem(i)}>
              Delete
            </button>
          </div>

          <Field label="Title">
            <input
              className="adm-input"
              style={{ width: "100%" }}
              value={item.title}
              onChange={(e) => updateItem(i, { title: e.target.value })}
            />
          </Field>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Field label="Issuer">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.issuer}
                  placeholder="e.g. Coursera"
                  onChange={(e) => updateItem(i, { issuer: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <Field label="Date">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.date}
                  placeholder="e.g. Mar 2025"
                  onChange={(e) => updateItem(i, { date: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <MediaPicker
            label="Image"
            accept="image"
            value={item.image}
            onChange={(url) => updateItem(i, { image: url })}
          />

          <Field label="Credential URL">
            <input
              className="adm-input"
              style={{ width: "100%" }}
              value={item.credentialUrl}
              placeholder="https://…"
              onChange={(e) => updateItem(i, { credentialUrl: e.target.value })}
            />
          </Field>

          <Field label="Accent color">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={HEX_RE.test(item.color || "") ? item.color : "#6366f1"}
                onChange={(e) => updateItem(i, { color: e.target.value })}
                style={{ width: 44, height: 32, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
              />
              <input
                className="adm-input"
                style={{ width: 110 }}
                value={item.color || ""}
                placeholder="#6366f1"
                onChange={(e) => updateItem(i, { color: e.target.value })}
              />
            </div>
          </Field>
        </div>
      ))}
    </div>
  );
}
