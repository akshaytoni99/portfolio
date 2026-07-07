import { Router } from "express";
import { requireAuth, verifyPreviewToken } from "../auth.js";
import {
  getContent,
  isSection,
  putDraft,
  publish,
  discard,
  publishAll,
  logActivity,
} from "../store.js";

function sanitizeString(value) {
  // Re-run until stable: single-pass replacement lets stripped tokens
  // reconstruct from their own remnants (e.g. "jjavascript:avascript:").
  let prev;
  let out = value;
  do {
    prev = out;
    out = out
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
      .replace(/<\/?script\b[^>]*>?/gi, "")
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");
  } while (out !== prev);
  return out;
}

export function sanitize(value) {
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = sanitize(val);
    return out;
  }
  return value;
}

function validateSection(req, res, next) {
  if (!isSection(req.params.section)) {
    return res.status(400).json({ error: `Unknown section: ${req.params.section}` });
  }
  next();
}

const router = Router();

// Public: published content only; ?preview=1&token=T returns drafts merged over published.
router.get("/api/content", (req, res) => {
  const content = getContent();
  const preview = req.query.preview === "1";
  if (preview && !verifyPreviewToken(req.query.token)) {
    return res.status(401).json({ error: "Invalid preview token" });
  }
  const out = {};
  for (const [section, entry] of Object.entries(content)) {
    out[section] = preview ? entry.draft ?? entry.published : entry.published;
  }
  res.json(out);
});

// Admin: full {draft, published, updatedAt} map.
router.get("/api/admin/content", requireAuth, (req, res) => {
  res.json(getContent());
});

router.put("/api/admin/content/:section", requireAuth, validateSection, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Draft body must be an object" });
    }
    const entry = await putDraft(req.params.section, sanitize(body));
    logActivity("save-draft", req.params.section, "Draft saved");
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/content/:section/publish", requireAuth, validateSection, async (req, res, next) => {
  try {
    const entry = await publish(req.params.section);
    logActivity("publish", req.params.section, "Section published");
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/content/:section/discard", requireAuth, validateSection, async (req, res, next) => {
  try {
    const entry = await discard(req.params.section);
    logActivity("discard", req.params.section, "Draft discarded");
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/publish-all", requireAuth, async (req, res, next) => {
  try {
    const published = await publishAll();
    logActivity("publish-all", null, `Published: ${published.join(", ") || "nothing to publish"}`);
    res.json({ ok: true, published });
  } catch (err) {
    next(err);
  }
});

export default router;
