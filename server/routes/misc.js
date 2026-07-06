import path from "path";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth.js";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES } from "./media.js";
import { sanitize } from "./content.js";
import {
  getActivity,
  exportAll,
  importAll,
  isSection,
  putDraft,
  publish,
  patchSection,
  logActivity,
} from "../store.js";

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `resume-${Date.now()}.pdf`),
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      return cb(new Error("Resume must be a PDF file"));
    }
    cb(null, true);
  },
});

function handleResumeUpload(req, res, next) {
  resumeUpload.any()(req, res, (err) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: err.message });
    }
    next();
  });
}

const router = Router();

router.get("/api/admin/activity", requireAuth, (req, res) => {
  res.json(getActivity());
});

router.get("/api/admin/export", requireAuth, (req, res) => {
  res.setHeader("Content-Disposition", 'attachment; filename="content.json"');
  res.json(exportAll());
});

router.post("/api/admin/import", requireAuth, (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Import body must be an object" });
  }
  const invalid = Object.keys(body).filter((key) => !isSection(key));
  if (invalid.length) {
    return res.status(400).json({ error: `Unknown sections: ${invalid.join(", ")}` });
  }
  const content = importAll(sanitize(body));
  logActivity("import", null, `Imported ${Object.keys(body).length} sections`);
  res.json({ ok: true, content });
});

router.post("/api/admin/resume", requireAuth, handleResumeUpload, (req, res) => {
  const file = (req.files || [])[0];
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const shape = {
    url: `/uploads/${file.filename}`,
    filename: path.basename(file.originalname),
    uploadedAt: new Date().toISOString(),
  };
  putDraft("resume", shape);
  publish("resume");
  // Keep the hero download button in sync wherever hero content already exists;
  // the public Hero component also reads the resume section directly as fallback.
  patchSection("hero", { resumeUrl: shape.url });
  logActivity("upload-resume", "resume", file.filename);
  res.json(shape);
});

export default router;
