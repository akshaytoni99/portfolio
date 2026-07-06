import { useEffect, useRef } from "react";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({ categories: [] });

const newCategory = () => ({
  id: crypto.randomUUID(),
  name: "",
  skills: [],
});

const newSkill = () => ({ name: "", level: 50, icon: "" });

export default function SkillsEditor({ draft, onChange }) {
  const confirm = useConfirm();
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const categories = data.categories || [];

  const commit = (next) => onChange({ ...data, categories: next });
  const updateCategory = (i, patch) =>
    commit(categories.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const updateSkill = (i, j, patch) =>
    updateCategory(i, {
      skills: categories[i].skills.map((s, k) => (k === j ? { ...s, ...patch } : s)),
    });

  const removeCategory = async (i) => {
    const name = categories[i]?.name || "this category";
    if (await confirm(`Delete category "${name}" and all its skills?`)) {
      commit(categories.filter((_, j) => j !== i));
    }
  };

  const removeSkill = async (i, j) => {
    const skill = categories[i].skills[j];
    if (skill?.name && !(await confirm(`Remove skill "${skill.name}"?`))) return;
    updateCategory(i, { skills: categories[i].skills.filter((_, k) => k !== j) });
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="adm-btn adm-btn-primary"
          onClick={() => commit([...categories, newCategory()])}
        >
          Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No skill categories yet.</div>
      ) : null}

      {categories.map((cat, i) => (
        <div key={cat.id} className="adm-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input
              className="adm-input"
              style={{ flex: 1 }}
              value={cat.name}
              placeholder="Category name (e.g. Machine Learning)"
              onChange={(e) => updateCategory(i, { name: e.target.value })}
            />
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeCategory(i)}>
              Delete
            </button>
          </div>

          {(cat.skills || []).map((skill, j) => (
            <div
              key={j}
              style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
            >
              <input
                className="adm-input"
                style={{ flex: "1 1 140px" }}
                value={skill.name}
                placeholder="Skill name"
                onChange={(e) => updateSkill(i, j, { name: e.target.value })}
              />
              <input
                type="range"
                min="1"
                max="100"
                value={skill.level ?? 50}
                style={{ flex: "1 1 120px", accentColor: "#6366f1" }}
                onChange={(e) => updateSkill(i, j, { level: Number(e.target.value) })}
              />
              <span style={{ width: 34, fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                {skill.level ?? 50}
              </span>
              <input
                className="adm-input"
                style={{ flex: "1 1 120px" }}
                value={skill.icon}
                placeholder="Icon (text or URL)"
                onChange={(e) => updateSkill(i, j, { icon: e.target.value })}
              />
              <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeSkill(i, j)}>
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="adm-btn"
            onClick={() => updateCategory(i, { skills: [...(cat.skills || []), newSkill()] })}
          >
            Add skill
          </button>
        </div>
      ))}
    </div>
  );
}
