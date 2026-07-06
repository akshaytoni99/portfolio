import { useEffect, useRef } from "react";
import MediaPicker from "../components/MediaPicker";
import RichText from "../components/RichText";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ items: [] });

const newItem = () => ({
  id: crypto.randomUUID(),
  name: "",
  role: "",
  text: "",
  avatar: "",
});

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

export default function TestimonialsEditor({ draft, onChange }) {
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
    const name = items[i]?.name || "this testimonial";
    if (await confirm(`Delete testimonial from "${name}"?`)) {
      commitItems(items.filter((_, j) => j !== i));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => commitItems([...items, newItem()])}>
          Add testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No testimonials yet.</div>
      ) : null}

      {items.map((item, i) => (
        <div key={item.id} className="adm-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 14 }}>{item.name || "Unnamed"}</span>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem(i)}>
              Delete
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Field label="Name">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Field label="Role">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.role}
                  placeholder="e.g. CTO, Meradhan"
                  onChange={(e) => updateItem(i, { role: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <Field label="Testimonial">
            <RichText
              value={item.text}
              onChange={(html) => updateItem(i, { text: html })}
              placeholder="What did they say?"
            />
          </Field>

          <MediaPicker
            label="Avatar"
            accept="image"
            value={item.avatar}
            onChange={(url) => updateItem(i, { avatar: url })}
          />
        </div>
      ))}
    </div>
  );
}
