import { useEffect, useRef, useState } from "react";
import MediaPicker from "../components/MediaPicker";
import RichText from "../components/RichText";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ items: [] });

const newProject = (order) => ({
  id: crypto.randomUUID(),
  title: "New project",
  description: "",
  tech: [],
  image: "",
  video: "",
  github: "",
  demo: "",
  featured: false,
  category: "",
  order,
  status: "completed",
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

export default function ProjectsEditor({ draft, onChange }) {
  const confirm = useConfirm();
  const inited = useRef(false);
  const dragIndex = useRef(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const items = data.items || [];

  // Any structural change rewrites `order` sequentially.
  const commitItems = (next) =>
    onChange({ ...data, items: next.map((p, i) => ({ ...p, order: i })) });

  const updateItem = (i, patch) =>
    commitItems(items.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commitItems(next);
  };

  const removeProject = async (i) => {
    const title = items[i]?.title || "this project";
    if (await confirm(`Delete "${title}"?`)) {
      commitItems(items.filter((_, j) => j !== i));
    }
  };

  const addProject = () => {
    const proj = newProject(items.length);
    commitItems([...items, proj]);
    setOpenId(proj.id);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-primary" onClick={addProject}>
          Add project
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No projects yet.</div>
      ) : null}

      {items.map((proj, i) => {
        const expanded = openId === proj.id;
        return (
          <div key={proj.id} className="adm-card" style={{ padding: 0, marginBottom: 10, overflow: "hidden" }}>
            <div
              draggable
              onDragStart={() => {
                dragIndex.current = i;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIndex.current;
                dragIndex.current = null;
                if (from != null) move(from, i);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                cursor: "grab",
              }}
            >
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
                ⠿
              </span>
              <button
                type="button"
                style={{
                  flex: 1,
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
                onClick={() => setOpenId(expanded ? null : proj.id)}
              >
                <span style={{ color: "#fff", fontSize: 14 }}>{proj.title || "Untitled project"}</span>
                {proj.featured ? (
                  <span className="adm-tag" style={{ marginLeft: 8 }}>
                    featured
                  </span>
                ) : null}
                <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {expanded ? "▲" : "▼"}
                </span>
              </button>
              <button type="button" className="adm-btn" disabled={i === 0} onClick={() => move(i, i - 1)}>
                ↑
              </button>
              <button
                type="button"
                className="adm-btn"
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
              >
                ↓
              </button>
              <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeProject(i)}>
                ✕
              </button>
            </div>

            {expanded ? (
              <div style={{ padding: "10px 12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <Field label="Title">
                  <input
                    className="adm-input"
                    style={{ width: "100%" }}
                    value={proj.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                  />
                </Field>
                <Field label="Description">
                  <RichText
                    value={proj.description}
                    onChange={(html) => updateItem(i, { description: html })}
                    placeholder="What does this project do?"
                  />
                </Field>
                <Field label="Tech stack">
                  <TagList tags={proj.tech || []} onChange={(tech) => updateItem(i, { tech })} placeholder="e.g. React" />
                </Field>
                <MediaPicker
                  label="Image"
                  accept="image"
                  value={proj.image}
                  onChange={(url) => updateItem(i, { image: url })}
                />
                <MediaPicker
                  label="Video"
                  accept="video"
                  value={proj.video}
                  onChange={(url) => updateItem(i, { video: url })}
                />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px" }}>
                    <Field label="GitHub URL">
                      <input
                        className="adm-input"
                        style={{ width: "100%" }}
                        value={proj.github}
                        placeholder="https://github.com/…"
                        onChange={(e) => updateItem(i, { github: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div style={{ flex: "1 1 220px" }}>
                    <Field label="Demo URL">
                      <input
                        className="adm-input"
                        style={{ width: "100%" }}
                        value={proj.demo}
                        placeholder="https://…"
                        onChange={(e) => updateItem(i, { demo: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 160px" }}>
                    <Field label="Category">
                      <input
                        className="adm-input"
                        style={{ width: "100%" }}
                        value={proj.category}
                        placeholder="e.g. AI / Web"
                        onChange={(e) => updateItem(i, { category: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div style={{ flex: "0 0 auto" }}>
                    <Field label="Status">
                      <select
                        className="adm-input adm-select"
                        value={proj.status}
                        onChange={(e) => updateItem(i, { status: e.target.value })}
                      >
                        <option value="completed">completed</option>
                        <option value="in-progress">in-progress</option>
                      </select>
                    </Field>
                  </div>
                  <div className="adm-field" style={{ marginBottom: 14 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!proj.featured}
                        onChange={(e) => updateItem(i, { featured: e.target.checked })}
                      />
                      <span className="adm-label">Featured</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
