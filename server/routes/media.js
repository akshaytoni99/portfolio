import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { requireAuth } from "../auth.js";
import { logActivity } from "../store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const COMPRESS_THRESHOLD_BYTES = 200 * 1024;
const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 82;

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
const VIDEO_EXTS = ["mp4", "webm"];
const ALLOWED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, "pdf"];
// Raster formats sharp re-encodes; gif/svg are kept as-is (animation/vector safety).
const PROCESS_EXTS = ["png", "jpg", "jpeg", "webp"];

function extOf(name) {
  return path.extname(name).slice(1).toLowerCase();
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

function uniqueName(base, ext) {
  let name = `${base}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(UPLOADS_DIR, name))) {
    name = `${base}-${counter}${ext}`;
    counter += 1;
  }
  return name;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const { base, ext } = safeBaseName(file.originalname);
      cb(null, uniqueName(base, ext));
    },
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    const ext = extOf(file.originalname);
    if (!ALLOWED_EXTS.includes(ext)) {
      return cb(new Error(`File type not allowed: .${ext || "unknown"}`));
    }
    cb(null, true);
  },
});

function handleUpload(req, res, next) {
  upload.any()(req, res, (err) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: err.message });
    }
    next();
  });
}

const router = Router();

router.post("/api/admin/media", requireAuth, handleUpload, async (req, res) => {
  const file = (req.files || [])[0];
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  let finalName = file.filename;
  let finalPath = file.path;
  const ext = extOf(finalName);

  if (PROCESS_EXTS.includes(ext) && file.size > COMPRESS_THRESHOLD_BYTES) {
    try {
      const buffer = await sharp(finalPath)
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const base = path.basename(finalName, path.extname(finalName));
      const webpName = ext === "webp" ? finalName : uniqueName(base, ".webp");
      const webpPath = path.join(UPLOADS_DIR, webpName);
      fs.writeFileSync(webpPath, buffer);
      if (webpPath !== finalPath) fs.unlinkSync(finalPath);
      finalName = webpName;
      finalPath = webpPath;
    } catch {
      // Compression failed: keep the original upload untouched.
    }
  }

  const stat = fs.statSync(finalPath);
  logActivity("upload-media", null, finalName);
  res.json({
    url: `/uploads/${finalName}`,
    name: finalName,
    size: stat.size,
    type: fileType(finalName),
  });
});

router.get("/api/admin/media", requireAuth, (req, res) => {
  const files = fs
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
  res.json(files);
});

router.delete("/api/admin/media/:name", requireAuth, (req, res) => {
  const name = path.basename(req.params.name);
  if (!name || name === "." || name === ".." || name !== req.params.name) {
    return res.status(400).json({ error: "Invalid file name" });
  }
  const filePath = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).json({ error: "File not found" });
  }
  fs.unlinkSync(filePath);
  logActivity("delete-media", null, name);
  res.json({ ok: true });
});

export default router;
