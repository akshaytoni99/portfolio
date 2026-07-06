import { useEffect, useRef } from "react";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ items: [] });

const newItem = () => ({
  id: crypto.randomUUID(),
  degree: "",
  institution: "",
  duration: "",
  grade: "",
  description: "",
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

export default function EducationEditor({ draft, onChange }) {
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
    const label = items[i]?.degree || items[i]?.institution || "this entry";
    if (await confirm(`Delete "${label}"?`)) {
      commitItems(items.filter((_, j) => j !== i));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => commitItems([...items, newItem()])}>
          Add education
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No education entries yet.</div>
      ) : null}

      {items.map((item, i) => (
        <div key={item.id} className="adm-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 14 }}>{item.degree || "Untitled degree"}</span>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem(i)}>
              Delete
            </button>
          </div>

          <Field label="Degree">
            <input
              className="adm-input"
              style={{ width: "100%" }}
              value={item.degree}
              placeholder="e.g. B.Tech in AI & Data Science"
              onChange={(e) => updateItem(i, { degree: e.target.value })}
            />
          </Field>

          <Field label="Institution">
            <input
              className="adm-input"
              style={{ width: "100%" }}
              value={item.institution}
              onChange={(e) => updateItem(i, { institution: e.target.value })}
            />
          </Field>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <Field label="Duration">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.duration}
                  placeholder="2021 – 2025"
                  onChange={(e) => updateItem(i, { duration: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <Field label="Grade">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.grade}
                  placeholder="e.g. 8.5 CGPA"
                  onChange={(e) => updateItem(i, { grade: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <Field label="Description">
            <textarea
              className="adm-input adm-textarea"
              style={{ width: "100%", minHeight: 70, resize: "vertical" }}
              value={item.description}
              placeholder="Optional details"
              onChange={(e) => updateItem(i, { description: e.target.value })}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}
