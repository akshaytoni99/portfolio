# Deploying the portfolio + live CMS

Two pieces:
- **Frontend** (static Vite site) → Vercel
- **Backend** (Express + JSON store) → Render (or Railway/Fly — any Node host with a persistent disk)

The public site works with or without the backend (falls back to seed content).
The `/admin-portal` CMS needs the backend to save and publish.

---

## 1. Backend → Render

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → pick this repo. It reads `render.yaml`
   (Node web service + 1 GB persistent disk mounted at `/var/data`).
   - Plan must be **Starter or higher** for a persistent disk. The free plan's
     disk is ephemeral, so content/uploads would reset on every restart.
3. After the frontend is live (step 2), set the backend env var
   **`CLIENT_ORIGIN`** = your Vercel URL (e.g. `https://your-portfolio.vercel.app`)
   in the Render dashboard, then redeploy.
4. Note the backend URL, e.g. `https://portfolio-cms.onrender.com`.

Pre-set env vars (in `render.yaml`): `NODE_ENV=production`, `CROSS_SITE=true`,
`DATA_DIR=/var/data/cms`, `UPLOADS_DIR=/var/data/uploads`.

## 2. Frontend → Vercel

1. Vercel → **Add New → Project** → import this repo. Framework: **Vite**
   (build `npm run build`, output `dist` — already set in `vercel.json`).
2. Project → Settings → **Environment Variables**:
   - `VITE_API_BASE` = your Render backend URL (from step 1.4)
   - `VITE_ADMIN_ROUTE` = `/admin-portal` (or a secret of your choosing)
3. Deploy. Every future `git push` auto-redeploys.

## 3. First run

- Visit `https://your-portfolio.vercel.app/admin-portal` → set your admin password.
- Edit any section → **Publish** → the public site updates live. No redeploy needed.

---

## Local development

```
npm install
npm run dev:all      # Express API on :5174 + Vite on :5173 (proxied)
```
Leave `VITE_API_BASE` empty locally — the Vite dev proxy handles `/api` + `/uploads`.

## Notes
- `server/data/` and `server/uploads/` are gitignored — content and uploads live
  only on the backend's disk, never in the repo.
- Back up content anytime from the admin: **Activity → Export** (downloads
  `content.json`); restore with **Import**.
- Alternative hosts: Railway (add a volume, set the same env vars) or Fly.io
  (`fly volumes create`, mount at `/var/data`). The server is host-agnostic.
