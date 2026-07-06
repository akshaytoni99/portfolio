import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./auth.js";
import contentRouter from "./routes/content.js";
import mediaRouter, { UPLOADS_DIR } from "./routes/media.js";
import miscRouter from "./routes/misc.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5174;
const SERVE_DIST =
  process.env.NODE_ENV === "production" || process.argv.includes("--serve-dist");
const ADMIN_ROUTE = process.env.VITE_ADMIN_ROUTE || "/admin-portal";

const app = express();
app.disable("x-powered-by");

// Cross-origin: allow the deployed frontend origin(s) to call this API with
// credentials. CLIENT_ORIGIN is a comma-separated allowlist. When unset,
// same-origin only (local/dev/prod-serving-dist) — no CORS needed.
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
if (CLIENT_ORIGINS.length) {
  app.set("trust proxy", 1); // secure cookies behind a hosting proxy (Render/Railway)
  app.use(
    cors({
      origin: CLIENT_ORIGINS,
      credentials: true,
    })
  );
}

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Keep the admin API out of search indexes.
app.use("/api/admin", (req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

app.use(authRouter);
app.use(contentRouter);
app.use(mediaRouter);
app.use(miscRouter);

// Uploaded files are served in every mode.
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (SERVE_DIST) {
  const distDir = path.join(__dirname, "../dist");
  const indexHtml = path.join(distDir, "index.html");
  app.use(express.static(distDir, { index: false }));
  // SPA fallback: any non-API GET serves the app shell.
  app.use((req, res, next) => {
    if (req.method !== "GET" || !fs.existsSync(indexHtml)) return next();
    if (req.path.startsWith(ADMIN_ROUTE)) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }
    res.sendFile(indexHtml);
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`CMS server listening on http://localhost:${PORT}`);
});
