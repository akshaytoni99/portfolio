import { useEffect, useRef, useState } from "react";
import RichText from "../components/RichText";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ items: [] });

const newItem = () => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  duration: "",
  location: "",
  description: "",
  technologies: [],
  achievements: [],
  tag: "",
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

function TagList({ tags, onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    setText("");
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="adm-tag"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          {t}
          <button
            type="button"
            className="adm-btn"
            aria-label={`Remove ${t}`}
            style={{ padding: "0 4px", lineHeight: 1 }}
            onClick={() => onChange(tags.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        className="adm-input"
        style={{ width: 150 }}
        value={text}
        placeholder={placeholder || "Add + Enter"}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
      />
      <button type="button" className="adm-btn" onClick={add}>
        Add
      </button>
    </div>
  );
}

export default function ExperienceEditor({ draft, onChange }) {
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
    const label = items[i]?.company || items[i]?.role || "this experience";
    if (await confirm(`Delete "${label}"?`)) {
      commitItems(items.filter((_, j) => j !== i));
    }
  };

  const removeAchievement = async (i, j) => {
    const value = items[i].achievements[j];
    if (value && !(await confirm("Remove this achievement?"))) return;
    updateItem(i, { achievements: items[i].achievements.filter((_, k) => k !== j) });
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => commitItems([...items, newItem()])}>
          Add experience
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No experience entries yet.</div>
      ) : null}

      {items.map((item, i) => (
        <div key={item.id} className="adm-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 14 }}>
              {item.role || "Role"} {item.company ? `@ ${item.company}` : ""}
            </span>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem(i)}>
              Delete
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Field label="Company">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.company}
                  onChange={(e) => updateItem(i, { company: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Field label="Role">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.role}
                  onChange={(e) => updateItem(i, { role: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <Field label="Duration">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.duration}
                  placeholder="Jan 2024 – Present"
                  onChange={(e) => updateItem(i, { duration: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <Field label="Location">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.location}
                  placeholder="Remote / City"
                  onChange={(e) => updateItem(i, { location: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <Field label="Tag">
                <input
                  className="adm-input"
                  style={{ width: "100%" }}
                  value={item.tag}
                  placeholder="e.g. Internship"
                  onChange={(e) => updateItem(i, { tag: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <Field label="Description">
            <RichText
              value={item.description}
              onChange={(html) => updateItem(i, { description: html })}
              placeholder="What did you work on?"
            />
          </Field>

          <Field label="Technologies">
            <TagList
              tags={item.technologies || []}
              onChange={(technologies) => updateItem(i, { technologies })}
              placeholder="e.g. Python"
            />
          </Field>

          <Field label="Achievements">
            {(item.achievements || []).map((ach, j) => (
              <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  className="adm-input"
                  style={{ flex: 1 }}
                  value={ach}
                  placeholder="Achievement"
                  onChange={(e) =>
                    updateItem(i, {
                      achievements: item.achievements.map((a, k) => (k === j ? e.target.value : a)),
                    })
                  }
                />
                <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeAchievement(i, j)}>
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="adm-btn"
              onClick={() => updateItem(i, { achievements: [...(item.achievements || []), ""] })}
            >
              Add achievement
            </button>
          </Field>
        </div>
      ))}
    </div>
  );
}
