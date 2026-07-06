import { useEffect, useRef, useState } from "react";
import MediaPicker from "../components/MediaPicker";

const emptyDraft = () => ({
  title: "",
  description: "",
  keywords: [],
  ogImage: "",
  favicon: "",
});

function Field({ label, children, extra }) {
  return (
    <div className="adm-field" style={{ marginBottom: 14 }}>
      <label
        className="adm-label"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}
      >
        <span>{label}</span>
        {extra}
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

export default function SeoEditor({ draft, onChange }) {
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();
  const setField = (key, val) => onChange({ ...data, [key]: val });
  const descLen = (data.description || "").length;

  return (
    <div>
      <Field label="Title">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.title}
          placeholder="Site title"
          onChange={(e) => setField("title", e.target.value)}
        />
      </Field>
      <Field
        label="Description"
        extra={
          <span style={{ fontSize: 12, color: descLen > 160 ? "#f87171" : "rgba(255,255,255,0.45)" }}>
            {descLen}/160
          </span>
        }
      >
        <textarea
          className="adm-input adm-textarea"
          style={{ width: "100%", minHeight: 80, resize: "vertical" }}
          value={data.description}
          placeholder="Meta description (aim for 160 characters or fewer)"
          onChange={(e) => setField("description", e.target.value)}
        />
      </Field>
      <Field label="Keywords">
        <TagList tags={data.keywords} onChange={(kw) => setField("keywords", kw)} placeholder="e.g. portfolio" />
      </Field>
      <MediaPicker
        label="OG image (social share preview)"
        accept="image"
        value={data.ogImage}
        onChange={(url) => setField("ogImage", url)}
      />
      <MediaPicker label="Favicon" accept="image" value={data.favicon} onChange={(url) => setField("favicon", url)} />
    </div>
  );
}
