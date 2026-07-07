import path from "path";
import { Router } from "express";
import { requireAuth } from "../auth.js";
import { runUpload, storeObject } from "./media.js";
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

const handleResumeUpload = runUpload((file) =>
  path.extname(file.originalname).toLowerCase() === ".pdf"
    ? null
    : "Resume must be a PDF file"
);

const router = Router();

router.get("/api/admin/activity", requireAuth, (req, res) => {
  res.json(getActivity());
});

router.get("/api/admin/export", requireAuth, (req, res) => {
  res.setHeader("Content-Disposition", 'attachment; filename="content.json"');
  res.json(exportAll());
});

router.post("/api/admin/import", requireAuth, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Import body must be an object" });
    }
    const invalid = Object.keys(body).filter((key) => !isSection(key));
    if (invalid.length) {
      return res.status(400).json({ error: `Unknown sections: ${invalid.join(", ")}` });
    }
    const content = await importAll(sanitize(body));
    logActivity("import", null, `Imported ${Object.keys(body).length} sections`);
    res.json({ ok: true, content });
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/resume", requireAuth, handleResumeUpload, async (req, res, next) => {
  try {
    const file = (req.files || [])[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const stored = await storeObject("resume", ".pdf", file.buffer);
    const shape = {
      url: stored.url,
      filename: path.basename(file.originalname),
      uploadedAt: new Date().toISOString(),
    };
    await putDraft("resume", shape);
    await publish("resume");
    // Keep the hero download button in sync wherever hero content already exists;
    // the public Hero component also reads the resume section directly as fallback.
    await patchSection("hero", { resumeUrl: shape.url });
    logActivity("upload-resume", "resume", file.filename);
    res.json(shape);
  } catch (err) {
    next(err);
  }
});

export default router;
