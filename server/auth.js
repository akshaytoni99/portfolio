import crypto from "crypto";
import path from "path";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { DATA_DIR, readJson, writeJsonAtomic, logActivity } from "./store.js";

const AUTH_FILE = path.join(DATA_DIR, "auth.json");
const COOKIE_NAME = "cms_token";
const TOKEN_TTL = "30m";
const TOKEN_TTL_MS = 30 * 60 * 1000;
const SLIDE_THRESHOLD_MS = 15 * 60 * 1000;
const PREVIEW_TTL = "10m";
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

function getAuth() {
  let auth = readJson(AUTH_FILE, null);
  if (!auth || typeof auth !== "object" || !auth.jwtSecret) {
    auth = {
      passwordHash: auth?.passwordHash ?? null,
      jwtSecret: crypto.randomBytes(48).toString("hex"),
    };
    writeJsonAtomic(AUTH_FILE, auth);
  }
  return auth;
}

function saveAuth(auth) {
  writeJsonAtomic(AUTH_FILE, auth);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_MS,
  };
}

function signToken(secret) {
  return jwt.sign({ scope: "admin" }, secret, { expiresIn: TOKEN_TTL });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function verifyAdminToken(token, secret) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret);
    return payload.scope === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const auth = getAuth();
  const payload = verifyAdminToken(req.cookies?.[COOKIE_NAME], auth.jwtSecret);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  // Sliding expiry: reissue the cookie when less than 15 minutes remain.
  if (payload.exp * 1000 - Date.now() < SLIDE_THRESHOLD_MS) {
    setAuthCookie(res, signToken(auth.jwtSecret));
  }
  req.auth = payload;
  next();
}

export function verifyPreviewToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getAuth().jwtSecret);
    return payload.scope === "preview" ? payload : null;
  } catch {
    return null;
  }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again in 15 minutes" },
  validate: { xForwardedForHeader: false },
});

const router = Router();

router.get("/api/auth/status", (req, res) => {
  const auth = getAuth();
  const authed = Boolean(verifyAdminToken(req.cookies?.[COOKIE_NAME], auth.jwtSecret));
  res.json({ setup: Boolean(auth.passwordHash), authed });
});

router.post("/api/auth/setup", async (req, res) => {
  const auth = getAuth();
  if (auth.passwordHash) {
    return res.status(400).json({ error: "Already set up" });
  }
  const password = req.body?.password;
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }
  auth.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  saveAuth(auth);
  setAuthCookie(res, signToken(auth.jwtSecret));
  logActivity("setup", null, "Admin password created");
  res.json({ ok: true });
});

router.post("/api/auth/login", loginLimiter, async (req, res) => {
  const auth = getAuth();
  if (!auth.passwordHash) {
    return res.status(400).json({ error: "Setup required" });
  }
  const password = req.body?.password;
  if (typeof password !== "string" || !(await bcrypt.compare(password, auth.passwordHash))) {
    return res.status(401).json({ error: "Invalid password" });
  }
  setAuthCookie(res, signToken(auth.jwtSecret));
  res.json({ ok: true });
});

router.post("/api/auth/logout", (req, res) => {
  const opts = { ...cookieOptions() };
  delete opts.maxAge;
  res.clearCookie(COOKIE_NAME, opts);
  res.json({ ok: true });
});

router.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const auth = getAuth();
  const { current, next } = req.body ?? {};
  if (typeof current !== "string" || !(await bcrypt.compare(current, auth.passwordHash))) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  if (typeof next !== "string" || next.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }
  auth.passwordHash = await bcrypt.hash(next, BCRYPT_ROUNDS);
  saveAuth(auth);
  setAuthCookie(res, signToken(auth.jwtSecret));
  logActivity("change-password", null, "Admin password changed");
  res.json({ ok: true });
});

router.post("/api/auth/preview-token", requireAuth, (req, res) => {
  const auth = getAuth();
  const token = jwt.sign({ scope: "preview" }, auth.jwtSecret, { expiresIn: PREVIEW_TTL });
  res.json({ token });
});

export default router;
