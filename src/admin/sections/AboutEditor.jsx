import { useEffect, useRef } from "react";
import MediaPicker from "../components/MediaPicker";
import RichText from "../components/RichText";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({
  paragraphs: [],
  highlights: [],
  stats: [],
  image: "",
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

export default function AboutEditor({ draft, onChange }) {
  const confirm = useConfirm();
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const setField = (key, val) => onChange({ ...data, [key]: val });
  const updateItem = (key, i, patch) =>
    setField(key, data[key].map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const removeItem = async (key, i, what) => {
    if (await confirm(`Remove this ${what}?`)) {
      setField(key, data[key].filter((_, j) => j !== i));
    }
  };
  const move = (key, i, dir) => {
    const arr = [...data[key]];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setField(key, arr);
  };

  return (
    <div>
      <Field label="Paragraphs">
        {data.paragraphs.map((para, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <RichText
                value={para}
                onChange={(html) =>
                  setField("paragraphs", data.paragraphs.map((p, j) => (j === i ? html : p)))
                }
                placeholder={`Paragraph ${i + 1}…`}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button type="button" className="adm-btn" disabled={i === 0} onClick={() => move("paragraphs", i, -1)}>
                ↑
              </button>
              <button
                type="button"
                className="adm-btn"
                disabled={i === data.paragraphs.length - 1}
                onClick={() => move("paragraphs", i, 1)}
              >
                ↓
              </button>
              <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem("paragraphs", i, "paragraph")}>
                ✕
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="adm-btn" onClick={() => setField("paragraphs", [...data.paragraphs, ""])}>
          Add paragraph
        </button>
      </Field>

      <Field label="Highlights">
        {data.highlights.map((hl, i) => (
          <div
            key={hl.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
          >
            <input
              className="adm-input"
              style={{ width: 90 }}
              value={hl.icon}
              placeholder="Icon"
              onChange={(e) => updateItem("highlights", i, { icon: e.target.value })}
            />
            <input
              className="adm-input"
              style={{ flex: "1 1 180px" }}
              value={hl.label}
              placeholder="Label"
              onChange={(e) => updateItem("highlights", i, { label: e.target.value })}
            />
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem("highlights", i, "highlight")}>
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setField("highlights", [...data.highlights, { id: crypto.randomUUID(), icon: "", label: "" }])
          }
        >
          Add highlight
        </button>
      </Field>

      <Field label="Stats">
        {data.stats.map((st, i) => (
          <div
            key={st.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
          >
            <input
              className="adm-input"
              type="number"
              style={{ width: 90 }}
              value={st.value ?? ""}
              placeholder="Value"
              onChange={(e) => updateItem("stats", i, { value: e.target.value })}
              onBlur={(e) => updateItem("stats", i, { value: Number(e.target.value) || 0 })}
            />
            <input
              className="adm-input"
              style={{ width: 70 }}
              value={st.suffix}
              placeholder="+"
              onChange={(e) => updateItem("stats", i, { suffix: e.target.value })}
            />
            <input
              className="adm-input"
              style={{ flex: "1 1 160px" }}
              value={st.label}
              placeholder="Label"
              onChange={(e) => updateItem("stats", i, { label: e.target.value })}
            />
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem("stats", i, "stat")}>
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setField("stats", [...data.stats, { id: crypto.randomUUID(), value: 0, suffix: "", label: "" }])
          }
        >
          Add stat
        </button>
      </Field>

      <MediaPicker label="Image" accept="image" value={data.image} onChange={(url) => setField("image", url)} />
    </div>
  );
}
