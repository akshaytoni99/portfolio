import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { requireAuth } from "../auth.js";
import { logActivity, getSupabase, STORAGE_MODE } from "../store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(__dirname, "../uploads");
if (STORAGE_MODE === "file" && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const BUCKET = process.env.SUPABASE_BUCKET || "media";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const COMPRESS_THRESHOLD_BYTES = 200 * 1024;
const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 82;

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
const VIDEO_EXTS = ["mp4", "webm"];
const ALLOWED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, "pdf"];
// Raster formats sharp re-encodes; gif/svg are kept as-is (animation/vector safety).
const PROCESS_EXTS = ["png", "jpg", "jpeg", "webp"];

const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

function extOf(name) {
  return path.extname(name).slice(1).toLowerCase();
}

function contentType(name) {
  return MIME[extOf(name)] || "application/octet-stream";
}

function fileType(name) {
  const ext = extOf(name);
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (VIDEO_EXTS.includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "file";
}

function safeBaseName(original) {
  const ext = path.extname(original).toLowerCase();
  const base = path
    .basename(original, path.extname(original))
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return { base: base || "file", ext };
}

// ── Storage adapter: disk (file mode) or Supabase Storage (prod) ────
function fileUniqueName(base, ext) {
  let name = `${base}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(UPLOADS_DIR, name))) {
    name = `${base}-${counter}${ext}`;
    counter += 1;
  }
  return name;
}

// Store a buffer under a (base, ext); returns { name, url }.
export async function storeObject(base, ext, buffer) {
  if (STORAGE_MODE === "supabase") {
    // Supabase can't check existence cheaply; make the key unique by time.
    const name = `${base}-${Date.now()}${ext}`;
    const { error } = await getSupabase()
      .storage.from(BUCKET)
      .upload(name, buffer, { contentType: contentType(name), upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(name);
    return { name, url: data.publicUrl };
  }
  const name = fileUniqueName(base, ext);
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buffer);
  return { name, url: `/uploads/${name}` };
}

export async function listObjects() {
  if (STORAGE_MODE === "supabase") {
    const { data, error } = await getSupabase()
      .storage.from(BUCKET)
      .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw new Error(error.message);
    return (data || [])
      .filter((o) => o.name && o.id) // skip folder placeholders
      .map((o) => {
        const { data: pub } = getSupabase().storage.from(BUCKET).getPublicUrl(o.name);
        return {
          name: o.name,
          url: pub.publicUrl,
          size: o.metadata?.size ?? 0,
          mtime: o.created_at || null,
          type: fileType(o.name),
        };
      });
  }
  return fs
    .readdirSync(UPLOADS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, entry.name));
      return {
        name: entry.name,
        url: `/uploads/${entry.name}`,
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        type: fileType(entry.name),
      };
    })
    .sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
}

export async function removeObject(name) {
  if (STORAGE_MODE === "supabase") {
    const { error } = await getSupabase().storage.from(BUCKET).remove([name]);
    if (error) throw new Error(error.message);
    return true;
  }
  const filePath = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  fs.unlinkSync(filePath);
  return true;
}

// Process (optionally re-encode) an uploaded in-memory file, then store it.
export async function processAndStore(file) {
  const { base, ext } = safeBaseName(file.originalname);
  let outBase = base;
  let outExt = ext;
  let buffer = file.buffer;

  const plainExt = ext.slice(1);
  if (PROCESS_EXTS.includes(plainExt) && file.size > COMPRESS_THRESHOLD_BYTES) {
    try {
      buffer = await sharp(file.buffer)
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      outExt = ".webp";
    } catch {
      buffer = file.buffer; // compression failed: keep original
      outExt = ext;
    }
  }
  const stored = await storeObject(outBase, outExt, buffer);
  return { ...stored, size: buffer.length, type: fileType(stored.name) };
}

// ── Multer (memory) + upload guard shared by media + resume routes ──
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

export function runUpload(filter) {
  return (req, res, next) => {
    memoryUpload.any()(req, res, (err) => {
      if (err) {
        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({ error: err.message });
      }
      const file = (req.files || [])[0];
      if (file && filter) {
        const msg = filter(file);
        if (msg) return res.status(400).json({ error: msg });
      }
      next();
    });
  };
}

const mediaFilter = (file) => {
  const ext = extOf(file.originalname);
  return ALLOWED_EXTS.includes(ext) ? null : `File type not allowed: .${ext || "unknown"}`;
};

const router = Router();

router.post("/api/admin/media", requireAuth, runUpload(mediaFilter), async (req, res, next) => {
  try {
    const file = (req.files || [])[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const result = await processAndStore(file);
    logActivity("upload-media", null, result.name);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/api/admin/media", requireAuth, async (req, res, next) => {
  try {
    res.json(await listObjects());
  } catch (err) {
    next(err);
  }
});

router.delete("/api/admin/media/:name", requireAuth, async (req, res, next) => {
  try {
    const name = path.basename(req.params.name);
    if (!name || name === "." || name === ".." || name !== req.params.name) {
      return res.status(400).json({ error: "Invalid file name" });
    }
    const removed = await removeObject(name);
    if (!removed) return res.status(404).json({ error: "File not found" });
    logActivity("delete-media", null, name);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
