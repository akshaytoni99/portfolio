import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api, mediaSrc } from "../api";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v", ".ogv"];
const EXTS = { image: IMAGE_EXTS, video: VIDEO_EXTS, pdf: [".pdf"] };
const ACCEPT_ATTR = {
  image: "image/*",
  video: "video/*",
  pdf: "application/pdf,.pdf",
};

const CSS = `
.adm-mp-current { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.adm-mp-thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }
.adm-mp-filename { font-size: 13px; color: rgba(255,255,255,0.7); word-break: break-all; }
.adm-mp-overlay { position: fixed; inset: 0; background: rgba(3,7,18,0.8); backdrop-filter: blur(4px); z-index: 150; display: flex; align-items: center; justify-content: center; padding: 24px; }
.adm-mp-modal { width: min(760px, 100%); max-height: 84vh; overflow-y: auto; background: #0b1120; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px; }
.adm-mp-modal h3 { margin: 0 0 14px; font-size: 16px; color: #fff; }
.adm-mp-drop { border: 1px dashed rgba(255,255,255,0.25); border-radius: 10px; padding: 18px; text-align: center; color: rgba(255,255,255,0.55); font-size: 13px; cursor: pointer; margin-bottom: 16px; transition: border-color 0.15s, background 0.15s; }
.adm-mp-drop.dragover { border-color: #6366f1; background: rgba(99,102,241,0.08); }
.adm-mp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
.adm-mp-item { position: relative; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; cursor: pointer; background: rgba(255,255,255,0.03); }
.adm-mp-item:hover { border-color: #6366f1; }
.adm-mp-item.selected { border-color: #38bdf8; box-shadow: 0 0 0 1px #38bdf8; }
.adm-mp-item img { width: 100%; height: 84px; object-fit: cover; display: block; }
.adm-mp-ext { width: 100%; height: 84px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase; }
.adm-mp-name { font-size: 11px; color: rgba(255,255,255,0.65); padding: 6px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.adm-mp-del { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 6px; border: none; background: rgba(3,7,18,0.75); color: #f87171; font-size: 13px; line-height: 1; cursor: pointer; }
.adm-mp-del:hover { background: rgba(248,113,113,0.25); }
.adm-mp-empty { color: rgba(255,255,255,0.45); font-size: 13px; padding: 18px 0; text-align: center; }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.dataset.admMediaPicker = "";
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

function baseName(url) {
  return (url || "").split("/").pop() || "";
}

function matchesAccept(item, accept) {
  if (!accept || accept === "any") return true;
  const name = (item.name || item.url || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  if (accept === "pdf") return type.includes("pdf") || name.endsWith(".pdf");
  if (type.startsWith(accept)) return true;
  return (EXTS[accept] || []).some((ext) => name.endsWith(ext));
}

function listFrom(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.files)) return res.files;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.media)) return res.media;
  return [];
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/api/admin/media", fd);
}

export default function MediaPicker({ value, onChange, accept = "any", label }) {
  injectStyles();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(listFrom(await api.get("/api/admin/media")));
    } catch (err) {
      toast(err.message || "Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleUpload = async (files) => {
    const file = files && files[0];
    if (!file) return;
    // Drag-and-drop bypasses the <input accept> dialog filter — enforce here
    // so e.g. a PDF can't be dropped into an image-only picker.
    if (!matchesAccept({ name: file.name, type: file.type }, accept)) {
      toast(`Only ${accept} files are allowed here`, "error");
      return;
    }
    setUploading(true);
    try {
      const data = await uploadFile(file);
      toast(`Uploaded ${data.name || file.name}`);
      if (data.url) {
        onChange(data.url);
        setOpen(false);
      } else {
        load();
      }
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    const name = item.name || baseName(item.url);
    const ok = await confirm(`Delete ${name}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.del(`/api/admin/media/${encodeURIComponent(name)}`);
      toast(`Deleted ${name}`);
      if (item.url === value) onChange("");
      load();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const filtered = items.filter((it) => matchesAccept(it, accept));

  return (
    <div className="adm-field" style={{ marginBottom: 14 }}>
      {label ? (
        <label className="adm-label" style={{ display: "block", marginBottom: 6 }}>
          {label}
        </label>
      ) : null}
      <div className="adm-mp-current">
        {value ? (
          isImageUrl(value) ? (
            <img className="adm-mp-thumb" src={mediaSrc(value)} alt="" />
          ) : (
            <span className="adm-mp-filename">{baseName(value)}</span>
          )
        ) : (
          <span className="adm-mp-filename">None selected</span>
        )}
        <button type="button" className="adm-btn" onClick={() => setOpen(true)}>
          {value ? "Change" : "Choose"}
        </button>
        {value ? (
          <button type="button" className="adm-btn" onClick={() => onChange("")}>
            Clear
          </button>
        ) : null}
      </div>
      {open &&
        createPortal(
          <div className="adm-mp-overlay" onClick={() => setOpen(false)}>
            <div className="adm-mp-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Select {accept === "any" ? "a file" : `${accept} file`}</h3>
              <div
                className={`adm-mp-drop${dragOver ? " dragover" : ""}`}
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
                {uploading ? "Uploading…" : "Drop a file here or click to upload"}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT_ATTR[accept]}
                style={{ display: "none" }}
                onChange={(e) => {
                  handleUpload(e.target.files);
                  e.target.value = "";
                }}
              />
              {loading ? (
                <div className="adm-mp-empty">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="adm-mp-empty">
                  No {accept === "any" ? "files" : `${accept} files`} yet — upload one above.
                </div>
              ) : (
                <div className="adm-mp-grid">
                  {filtered.map((it) => {
                    const url = it.url || `/uploads/${it.name}`;
                    return (
                      <div
                        key={it.name || url}
                        className={`adm-mp-item${url === value ? " selected" : ""}`}
                        onClick={() => {
                          onChange(url);
                          setOpen(false);
                        }}
                      >
                        {isImageUrl(url) ? (
                          <img src={mediaSrc(url)} alt={it.name || ""} loading="lazy" />
                        ) : (
                          <div className="adm-mp-ext">{extOf(url).replace(".", "") || "file"}</div>
                        )}
                        <div className="adm-mp-name">{it.name || baseName(url)}</div>
                        <button
                          type="button"
                          className="adm-mp-del"
                          aria-label="Delete file"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(it);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <button type="button" className="adm-btn" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
