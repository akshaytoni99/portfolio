import { useEffect, useRef, useState } from "react";
import { api, mediaSrc } from "../api";
import { useToast } from "../components/Toast";

const emptyDraft = () => ({
  url: "",
  filename: "",
  uploadedAt: "",
});

function baseName(url) {
  return (url || "").split("/").pop() || "";
}

export default function ResumeEditor({ draft, onChange }) {
  const toast = useToast();
  const inited = useRef(false);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!inited.current && draft == null) {
      inited.current = true;
      onChange(emptyDraft());
    }
  }, [draft, onChange]);

  const data = draft ?? emptyDraft();

  const handleUpload = async (files) => {
    const file = files && files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const section = await api.post("/api/admin/resume", fd);
      if (section?.url) {
        onChange({
          url: section.url,
          filename: section.filename ?? baseName(section.url),
          uploadedAt: section.uploadedAt ?? new Date().toISOString(),
        });
      }
      toast(`Uploaded ${file.name}`);
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className="adm-card"
        style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: 14, marginBottom: 14 }}
      >
        <div style={{ flex: "1 1 220px" }}>
          <div style={{ fontSize: 14, color: "#fff", wordBreak: "break-all" }}>
            {data.filename || baseName(data.url) || "No resume uploaded yet"}
          </div>
          {data.uploadedAt ? (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              Uploaded {new Date(data.uploadedAt).toLocaleString()}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload new PDF"}
          </button>
          {data.url ? (
            <a className="adm-btn" href={mediaSrc(data.url)} download={data.filename || undefined}>
              Download
            </a>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 14px" }}>
        Uploading a new resume replaces the live one immediately (draft and published are both updated).
      </p>

      {data.url ? (
        <iframe
          title="Resume preview"
          src={mediaSrc(data.url)}
          style={{
            width: "100%",
            height: 480,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            background: "#fff",
          }}
        />
      ) : (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          Upload a PDF to see the preview here.
        </div>
      )}
    </div>
  );
}
