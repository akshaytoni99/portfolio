import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DATA_DIR is overridable so a hosting platform can mount a persistent
// disk (e.g. Render/Railway/Fly volume) outside the code directory.
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");

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

// ── Backend selection ─────────────────────────────────────────────
// Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY are set (production);
// otherwise a local JSON file store (dev, zero external deps).
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
export const STORAGE_MODE = SUPABASE_URL && SUPABASE_SERVICE_KEY ? "supabase" : "file";
const KV_TABLE = process.env.SUPABASE_KV_TABLE || "cms_kv";

let supabase = null;
export function getSupabase() {
  if (STORAGE_MODE !== "supabase") return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

// ── File adapter helpers ──────────────────────────────────────────
const FILES = {
  content: path.join(DATA_DIR, "content.json"),
  activity: path.join(DATA_DIR, "activity.json"),
  auth: path.join(DATA_DIR, "auth.json"),
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJson(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    try {
      fs.renameSync(file, `${file}.corrupt-${Date.now()}`);
    } catch {
      /* ignore */
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

// ── Unified key read/write across backends ────────────────────────
async function loadKey(key, fallback) {
  if (STORAGE_MODE === "supabase") {
    const { data, error } = await getSupabase()
      .from(KV_TABLE)
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new Error(`Supabase read (${key}): ${error.message}`);
    return data ? data.value : fallback;
  }
  return readJson(FILES[key], fallback);
}

async function saveKey(key, value) {
  if (STORAGE_MODE === "supabase") {
    const { error } = await getSupabase()
      .from(KV_TABLE)
      .upsert({ key, value }, { onConflict: "key" });
    if (error) throw new Error(`Supabase write (${key}): ${error.message}`);
    return;
  }
  writeJsonAtomic(FILES[key], value);
}

// ── Content shape helpers ─────────────────────────────────────────
function emptySection() {
  return { draft: null, published: null, updatedAt: null };
}

function normalizeContent(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const content = {};
  for (const section of SECTIONS) {
    const entry = source[section];
    content[section] =
      entry && typeof entry === "object" && !Array.isArray(entry)
        ? {
            draft: entry.draft ?? null,
            published: entry.published ?? null,
            updatedAt: entry.updatedAt ?? null,
          }
        : emptySection();
  }
  return content;
}

// ── In-memory cache (hydrated once at boot) ───────────────────────
let CONTENT = null;
let ACTIVITY = null;
let AUTH = null;
let ready = false;

export async function init() {
  const rawContent = await loadKey("content", null);
  CONTENT = normalizeContent(rawContent);
  if (!rawContent) await saveKey("content", CONTENT);

  const rawActivity = await loadKey("activity", []);
  ACTIVITY = Array.isArray(rawActivity) ? rawActivity : [];

  const rawAuth = await loadKey("auth", null);
  AUTH = rawAuth && typeof rawAuth === "object" ? rawAuth : { passwordHash: null, jwtSecret: null };

  ready = true;
  return STORAGE_MODE;
}

function assertReady() {
  if (!ready) {
    throw new Error("store.init() must be awaited before use");
  }
}

// ── Content: sync reads from cache, async write-through ────────────
export function isSection(section) {
  return SECTIONS.includes(section);
}

export function getContent() {
  assertReady();
  return CONTENT;
}

export function getSection(section) {
  assertReady();
  return CONTENT[section] ?? null;
}

async function commitContent() {
  await saveKey("content", CONTENT);
}

export async function putDraft(section, shape) {
  assertReady();
  CONTENT[section] = { ...CONTENT[section], draft: shape, updatedAt: new Date().toISOString() };
  await commitContent();
  return CONTENT[section];
}

export async function publish(section) {
  assertReady();
  const entry = CONTENT[section];
  if (entry.draft !== null) {
    CONTENT[section] = {
      draft: entry.draft,
      published: structuredClone(entry.draft),
      updatedAt: new Date().toISOString(),
    };
    await commitContent();
  }
  return CONTENT[section];
}

// Patch fields inside a section's draft and/or published states without
// promoting unrelated draft edits. Skips states that are null.
export async function patchSection(section, patch) {
  assertReady();
  const entry = CONTENT[section];
  let touched = false;
  for (const state of ["draft", "published"]) {
    if (entry[state] && typeof entry[state] === "object") {
      entry[state] = { ...entry[state], ...patch };
      touched = true;
    }
  }
  if (touched) {
    entry.updatedAt = new Date().toISOString();
    await commitContent();
  }
  return CONTENT[section];
}

export async function discard(section) {
  assertReady();
  const entry = CONTENT[section];
  CONTENT[section] = {
    draft: entry.published !== null ? structuredClone(entry.published) : null,
    published: entry.published,
    updatedAt: new Date().toISOString(),
  };
  await commitContent();
  return CONTENT[section];
}

export async function publishAll() {
  assertReady();
  const published = [];
  for (const section of SECTIONS) {
    const entry = CONTENT[section];
    if (entry.draft !== null) {
      CONTENT[section] = {
        draft: entry.draft,
        published: structuredClone(entry.draft),
        updatedAt: new Date().toISOString(),
      };
      published.push(section);
    }
  }
  if (published.length) await commitContent();
  return published;
}

export async function importAll(json) {
  assertReady();
  CONTENT = normalizeContent(json);
  await commitContent();
  return CONTENT;
}

export function exportAll() {
  assertReady();
  return CONTENT;
}

// ── Activity log ──────────────────────────────────────────────────
export async function logActivity(action, section = null, detail = null) {
  assertReady();
  ACTIVITY.unshift({ ts: new Date().toISOString(), action, section, detail });
  ACTIVITY = ACTIVITY.slice(0, ACTIVITY_CAP);
  try {
    await saveKey("activity", ACTIVITY);
  } catch {
    /* activity is non-critical — never fail a request over it */
  }
}

export function getActivity() {
  assertReady();
  return ACTIVITY;
}

// ── Auth persistence (used by auth.js) ────────────────────────────
export function getAuthData() {
  assertReady();
  return AUTH;
}

export async function saveAuthData(next) {
  assertReady();
  AUTH = next;
  await saveKey("auth", AUTH);
  return AUTH;
}
