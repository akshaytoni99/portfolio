import { useCallback, useEffect, useRef, useState } from "react";
import { api, mediaSrc } from "../api";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/Confirm";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

const CSS = `
.adm-mm-drop { border: 1px dashed rgba(255,255,255,0.25); border-radius: 10px; padding: 22px; text-align: center; color: rgba(255,255,255,0.55); font-size: 13px; cursor: pointer; margin-bottom: 16px; transition: border-color 0.15s, background 0.15s; }
.adm-mm-drop.dragover { border-color: #6366f1; background: rgba(99,102,241,0.08); }
.adm-mm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.adm-mm-item { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.03); display: flex; flex-direction: column; }
.adm-mm-item img { width: 100%; height: 110px; object-fit: cover; display: block; }
.adm-mm-ext { width: 100%; height: 110px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase; }
.adm-mm-meta { padding: 8px 10px; }
.adm-mm-name { font-size: 12px; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.adm-mm-size { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.adm-mm-actions { display: flex; gap: 6px; padding: 0 10px 10px; }
.adm-mm-empty { color: rgba(255,255,255,0.45); font-size: 13px; padding: 24px 0; text-align: center; }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.dataset.admMediaManager = "";
  style.textContent = CSS;
  document.head.appendChild(style);
}

function extOf(name) {
  const m = /\.[a-z0-9]+$/i.exec(name || "");
  return m ? m[0].toLowerCase() : "";
}

function isImageUrl(url) {
  return IMAGE_EXTS.includes(extOf(url));
}

function formatBytes(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function listFrom(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.files)) return res.files;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.media)) return res.media;
  return [];
}

// Kept the standard editor signature; the media library has no draft to edit,
// so `draft`/`onChange` are intentionally unused.
export default function MediaManager() {
  injectStyles();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(() => {
    api
      .get("/api/admin/media")
      .then((res) => setItems(listFrom(res)))
      .catch((err) => {
        if (err.status !== 401) toast(err.message || "Failed to load media", "error");
        setItems([]);
      });
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        await api.post("/api/admin/media", fd);
        ok += 1;
      } catch (err) {
        toast(`${file.name}: ${err.message || "upload failed"}`, "error");
      }
    }
    setUploading(false);
    if (ok > 0) {
      toast(ok === 1 ? "1 file uploaded" : `${ok} files uploaded`);
      load();
    }
  };

  const handleDelete = async (item) => {
    const name = item.name || (item.url || "").split("/").pop();
    const ok = await confirm(`Delete ${name}? Anything referencing it will break.`);
    if (!ok) return;
    try {
      await api.del(`/api/admin/media/${encodeURIComponent(name)}`);
      toast(`Deleted ${name}`);
      load();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const copyUrl = async (url) => {
    try {
      const absolute = new URL(url, window.location.origin).href;
      await navigator.clipboard.writeText(absolute);
      toast("URL copied to clipboard");
    } catch {
      toast("Could not copy URL", "error");
    }
  };

  return (
    <div>
      <div
        className={`adm-mm-drop${dragOver ? " dragover" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
      >
        {uploading ? "Uploading…" : "Drop files here or click to upload (images, videos, PDFs)"}
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = "";
        }}
      />

      {items === null ? (
        <div className="adm-mm-empty">Loading…</div>
      ) : items.length === 0 ? (
        <div className="adm-mm-empty">No files uploaded yet.</div>
      ) : (
        <div className="adm-mm-grid">
          {items.map((it) => {
            const url = it.url || `/uploads/${it.name}`;
            const name = it.name || url.split("/").pop();
            return (
              <div key={name} className="adm-mm-item">
                {isImageUrl(url) ? (
                  <img src={mediaSrc(url)} alt={name} loading="lazy" />
                ) : (
                  <div className="adm-mm-ext">{extOf(url).replace(".", "") || "file"}</div>
                )}
                <div className="adm-mm-meta">
                  <div className="adm-mm-name" title={name}>
                    {name}
                  </div>
                  <div className="adm-mm-size">{formatBytes(it.size)}</div>
                </div>
                <div className="adm-mm-actions">
                  <button type="button" className="adm-btn" style={{ flex: 1 }} onClick={() => copyUrl(url)}>
                    Copy URL
                  </button>
                  <button type="button" className="adm-btn adm-btn-danger" onClick={() => handleDelete(it)}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
