import { useEffect, useRef } from "react";
import { useConfirm } from "../components/Confirm";

const emptyDraft = () => ({
  email: "",
  phone: "",
  location: "",
  github: "",
  linkedin: "",
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

export default function ContactEditor({ draft, onChange }) {
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
  const updateSocial = (i, patch) =>
    setField("socials", data.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const removeSocial = async (i) => {
    if (await confirm("Remove this social link?")) {
      setField("socials", data.socials.filter((_, j) => j !== i));
    }
  };

  return (
    <div>
      <Field label="Email">
        <input
          className="adm-input"
          type="email"
          style={{ width: "100%" }}
          value={data.email}
          placeholder="you@example.com"
          onChange={(e) => setField("email", e.target.value)}
        />
      </Field>
      <Field label="Phone">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.phone}
          placeholder="+91 …"
          onChange={(e) => setField("phone", e.target.value)}
        />
      </Field>
      <Field label="Location">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.location}
          placeholder="City, Country"
          onChange={(e) => setField("location", e.target.value)}
        />
      </Field>
      <Field label="GitHub URL">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.github}
          placeholder="https://github.com/…"
          onChange={(e) => setField("github", e.target.value)}
        />
      </Field>
      <Field label="LinkedIn URL">
        <input
          className="adm-input"
          style={{ width: "100%" }}
          value={data.linkedin}
          placeholder="https://www.linkedin.com/in/…"
          onChange={(e) => setField("linkedin", e.target.value)}
        />
      </Field>

      <Field label="Other socials">
        {data.socials.map((soc, i) => (
          <div
            key={soc.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}
          >
            <input
              className="adm-input"
              style={{ flex: "1 1 120px" }}
              value={soc.platform}
              placeholder="Platform"
              onChange={(e) => updateSocial(i, { platform: e.target.value })}
            />
            <input
              className="adm-input"
              style={{ flex: "2 1 180px" }}
              value={soc.url}
              placeholder="https://…"
              onChange={(e) => updateSocial(i, { url: e.target.value })}
            />
            <button type="button" className="adm-btn adm-btn-danger" onClick={() => removeSocial(i)}>
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
