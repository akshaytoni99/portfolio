# Deploying the portfolio + live CMS (100% free)

Three free pieces, no credit card:
- **Supabase** — stores CMS content + uploaded media (free tier)
- **Render** — runs the Express API (free plan; no disk needed)
- **Vercel** — serves the static site (free hobby)

The public site works with or without the backend (falls back to seed content).
The `/admin-portal` CMS needs the backend to save and publish.

Locally, no Supabase is required — the server auto-uses a JSON file store when
`SUPABASE_URL` is unset (`npm run dev:all`).

---

## 1. Supabase (storage)

1. [supabase.com](https://supabase.com) → sign in → **New project** (free, no card).
   Pick a name + database password (any). Wait ~1 min for it to provision.
2. **SQL Editor → New query** → paste all of `docs/supabase-setup.sql` → **Run**.
   (Creates the `cms_kv` table and a public `media` storage bucket.)
3. **Settings → API** → copy two values for step 2:
   - **Project URL** → `https://xxxx.supabase.co`
   - **service_role** secret key (under "Project API keys" — the secret one, *not* anon)

## 2. Backend → Render

1. Push this repo to GitHub (done).
2. Render Dashboard → **New → Blueprint** → pick this repo (reads `render.yaml`,
   **free** plan, no disk).
3. It will ask for these env vars (Environment tab):
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_SERVICE_KEY` = the service_role key
   - `JWT_SECRET` = any long random string (e.g. mash the keyboard 40+ chars) —
     keeps you logged in across restarts
   - `CLIENT_ORIGIN` = your Vercel URL (fill after step 3; can start blank and add later)
4. Deploy → copy the service URL, e.g. `https://portfolio-cms.onrender.com`.

## 3. Frontend → Vercel

1. Vercel → your project → **Settings → Environment Variables**:
   - `VITE_API_BASE` = your Render URL (from 2.4)
   - `VITE_ADMIN_ROUTE` = `/admin-portal` (or a secret of your choosing)
2. **Redeploy** (Deployments → ⋯ → Redeploy) so the env vars take effect.
3. Copy your Vercel URL and put it in Render's `CLIENT_ORIGIN` (step 2.3) → Render redeploys.

## 4. First run

- Visit `https://your-portfolio.vercel.app/admin-portal` → set your admin password.
- Edit any section → **Publish** → the public site updates live. No redeploy needed.
- Uploaded images/videos/PDF resume go to Supabase Storage automatically.

---

## Notes
- **Cold start**: Render's free service sleeps after ~15 min idle. The first
  visit after idle wakes it (~30 s); during that window the public site shows
  seed content, then hydrates to published content once the API responds.
  Upgrade Render (or keep it warm with a cron ping) to avoid this.
- **Backups**: admin → **Activity → Export** downloads `content.json`; **Import**
  restores it.
- **Local dev**: `npm run dev:all` (Express :5174 + Vite :5173). Leave
  `VITE_API_BASE` empty; the dev proxy handles `/api` + `/uploads`. Storage is a
  local JSON file — no Supabase needed.
- **Other hosts**: any Node host works (Railway, Fly, Koyeb). Set the same env
  vars; storage is Supabase so no volume is required.
