import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DATA_DIR is overridable so a hosting platform can mount a persistent
// disk (e.g. Render/Railway/Fly volume) outside the code directory.
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");

export const SECTIONS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "certifications",
  "education",
  "contact",
  "testimonials",
  "seo",
  "theme",
  "resume",
];

const ACTIVITY_CAP = 200;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJson(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // Corrupted file: set it aside and start fresh rather than crash.
    try {
      fs.renameSync(file, `${file}.corrupt-${Date.now()}`);
    } catch {
      // ignore
    }
    return fallback;
  }
}

export function writeJsonAtomic(file, data) {
  ensureDataDir();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

function emptySection() {
  return { draft: null, published: null, updatedAt: null };
}

function normalizeContent(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const content = {};
  for (const section of SECTIONS) {
    const entry = source[section];
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      content[section] = {
        draft: entry.draft ?? null,
        published: entry.published ?? null,
        updatedAt: entry.updatedAt ?? null,
      };
    } else {
      content[section] = emptySection();
    }
  }
  return content;
}

function loadContent() {
  const raw = readJson(CONTENT_FILE, null);
  const content = normalizeContent(raw);
  if (!raw) writeJsonAtomic(CONTENT_FILE, content);
  return content;
}

function saveContent(content) {
  writeJsonAtomic(CONTENT_FILE, content);
}

export function isSection(section) {
  return SECTIONS.includes(section);
}

export function getContent() {
  return loadContent();
}

export function getSection(section) {
  return loadContent()[section] ?? null;
}

export function putDraft(section, shape) {
  const content = loadContent();
  content[section] = {
    ...content[section],
    draft: shape,
    updatedAt: new Date().toISOString(),
  };
  saveContent(content);
  return content[section];
}

export function publish(section) {
  const content = loadContent();
  const entry = content[section];
  if (entry.draft !== null) {
    content[section] = {
      draft: entry.draft,
      published: structuredClone(entry.draft),
      updatedAt: new Date().toISOString(),
    };
    saveContent(content);
  }
  return content[section];
}

// Patch fields inside a section's draft and/or published states without
// promoting unrelated draft edits. Skips states that are null.
export function patchSection(section, patch) {
  const content = loadContent();
  const entry = content[section];
  let touched = false;
  for (const state of ["draft", "published"]) {
    if (entry[state] && typeof entry[state] === "object") {
      entry[state] = { ...entry[state], ...patch };
      touched = true;
    }
  }
  if (touched) {
    entry.updatedAt = new Date().toISOString();
    saveContent(content);
  }
  return content[section];
}

export function discard(section) {
  const content = loadContent();
  const entry = content[section];
  content[section] = {
    draft: entry.published !== null ? structuredClone(entry.published) : null,
    published: entry.published,
    updatedAt: new Date().toISOString(),
  };
  saveContent(content);
  return content[section];
}

export function publishAll() {
  const content = loadContent();
  const published = [];
  for (const section of SECTIONS) {
    const entry = content[section];
    if (entry.draft !== null) {
      content[section] = {
        draft: entry.draft,
        published: structuredClone(entry.draft),
        updatedAt: new Date().toISOString(),
      };
      published.push(section);
    }
  }
  saveContent(content);
  return published;
}

export function importAll(json) {
  const content = normalizeContent(json);
  saveContent(content);
  return content;
}

export function exportAll() {
  return loadContent();
}

export function logActivity(action, section = null, detail = null) {
  const entries = readJson(ACTIVITY_FILE, []);
  const list = Array.isArray(entries) ? entries : [];
  list.unshift({ ts: new Date().toISOString(), action, section, detail });
  writeJsonAtomic(ACTIVITY_FILE, list.slice(0, ACTIVITY_CAP));
}

export function getActivity() {
  const entries = readJson(ACTIVITY_FILE, []);
  return Array.isArray(entries) ? entries : [];
}
