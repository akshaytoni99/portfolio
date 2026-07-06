import { useEffect, useRef, useState } from "react";
import MediaPicker from "../components/MediaPicker";
import RichText from "../components/RichText";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({
  greeting: "",
  name: "",
  roles: [],
  description: "",
  resumeUrl: "",
  buttons: [],
  socials: [],
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

export default function HeroEditor({ draft, onChange }) {
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

  return (
    <div>
      <Field label="Greeting">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.greeting}
          placeholder="Hi, my name is"
          onChange={(e) => setField("greeting", e.target.value)}
        />
      </Field>
      <Field label="Name">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.name}
          placeholder="Your name"
          onChange={(e) => setField("name", e.target.value)}
        />
      </Field>
      <Field label="Roles (rotating titles)">
        <TagList tags={data.roles} onChange={(roles) => setField("roles", roles)} placeholder="e.g. AI Engineer" />
      </Field>
      <Field label="Description">
        <RichText
          value={data.description}
          onChange={(html) => setField("description", html)}
          placeholder="Short intro paragraph…"
        />
      </Field>
      <MediaPicker
        label="Resume (PDF)"
        accept="pdf"
        value={data.resumeUrl}
        onChange={(url) => setField("resumeUrl", url)}
      />

      <Field label="Buttons">
        {data.buttons.map((btn, i) => (
          <div
            key={btn.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
          >
            <input
              className="adm-input"
              style={{ flex: "1 1 120px" }}
              value={btn.label}
              placeholder="Label"
              onChange={(e) => updateItem("buttons", i, { label: e.target.value })}
            />
            <input
              className="adm-input"
              style={{ flex: "2 1 180px" }}
              value={btn.href}
              placeholder="Href (#contact, https://…)"
              onChange={(e) => updateItem("buttons", i, { href: e.target.value })}
            />
            <select
              className="adm-input adm-select"
              value={btn.style}
              onChange={(e) => updateItem("buttons", i, { style: e.target.value })}
            >
              <option value="primary">primary</option>
              <option value="outline">outline</option>
            </select>
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem("buttons", i, "button")}>
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setField("buttons", [
              ...data.buttons,
              { id: crypto.randomUUID(), label: "", href: "", style: "primary" },
            ])
          }
        >
          Add button
        </button>
      </Field>

      <Field label="Socials">
        {data.socials.map((soc, i) => (
          <div
            key={soc.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
          >
            <input
              className="adm-input"
              style={{ flex: "1 1 120px" }}
              value={soc.platform}
              placeholder="Platform (github, linkedin…)"
              onChange={(e) => updateItem("socials", i, { platform: e.target.value })}
            />
            <input
              className="adm-input"
              style={{ flex: "2 1 180px" }}
              value={soc.url}
              placeholder="https://…"
              onChange={(e) => updateItem("socials", i, { url: e.target.value })}
            />
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeItem("socials", i, "social link")}>
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setField("socials", [...data.socials, { id: crypto.randomUUID(), platform: "", url: "" }])
          }
        >
          Add social
        </button>
      </Field>
    </div>
  );
}
