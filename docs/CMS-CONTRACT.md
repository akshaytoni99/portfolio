# CMS Contract — single source of truth for all builders

Stack: Vite+React 19 SPA (existing portfolio) + Express server (`server/`) + JSON file store.
Node 24. ESM everywhere (`"type": "module"` stays). No TypeScript. Plain CSS (match existing style: dark #030712, indigo #6366f1, sky #38bdf8, borders rgba(255,255,255,0.1), Inter font).

## File layout
```
server/
  index.js          # express app entry; port 5174
  store.js          # JSON store: atomic read/write, per-section draft+published
  auth.js           # bcrypt+JWT cookie middleware, rate limit, setup/login/logout/change-password
  routes/
    content.js      # public GET published; admin CRUD on drafts + publish
    media.js        # upload (multer+sharp), list, delete
    misc.js         # activity log, backup/export/import, seo, resume upload
  data/             # gitignored runtime data
    content.json    # all sections {section: {draft, published, updatedAt}}
    auth.json       # {passwordHash, jwtSecret}
    activity.json   # [{ts, action, section, detail}] capped 200
  uploads/          # gitignored uploaded files
src/
  admin/            # ALL admin UI lives here, lazy-loaded
    AdminApp.jsx    # router-level component: auth gate + layout + section nav
    admin.css       # single stylesheet for admin (scoped .adm- prefix classes)
    api.js          # fetch wrapper: credentials include, JSON, error toast hook
    components/     # shared: Toast.jsx, Confirm.jsx, MediaPicker.jsx, RichText.jsx
    sections/       # one editor file per section (see list)
  content/
    ContentContext.jsx  # public-site provider: fetch /api/content, fallback to seeds
    seeds.js            # seed data extracted from current hardcoded components
```

## Sections & shapes (content.json)
Every section value: `{ draft: <shape>, published: <shape>|null, updatedAt: iso }`.
Public site uses `published ?? seed`. Admin edits `draft`, then POST publish copies draft→published.

- `hero`: { greeting, name, roles[], description, resumeUrl, buttons:[{label,href,style:'primary'|'outline'}], socials:[{platform,url}] }
- `about`: { paragraphs[], highlights:[{icon,label}], stats:[{value,suffix,label}] , image }
- `experience`: { items:[{id,company,role,duration,location,description,technologies[],achievements[],tag}] }
- `projects`: { items:[{id,title,description,tech[],image,video,github,demo,featured:bool,category,order:int,status:'completed'|'in-progress'}] }
- `skills`: { categories:[{id,name,skills:[{name,level:1-100,icon}]}] }
- `certifications`: { items:[{id,title,issuer,date,image,credentialUrl,color}] }
- `education`: { items:[{id,degree,institution,duration,grade,description}] }
- `contact`: { email, phone, location, github, linkedin, socials:[{platform,url}] }
- `testimonials`: { items:[{id,name,role,text,avatar}] }
- `seo`: { title, description, keywords, ogImage, favicon }
- `theme`: { primary, accent, background, animationsEnabled:bool }
- `resume`: { url, filename, uploadedAt }

IDs: `crypto.randomUUID()`. Order: integer, drag reorder writes sequential.

## API (all JSON; admin routes require auth cookie)
Public:
- GET  /api/content            → { section: publishedShape|null, ... } (only published)
- GET  /api/content?preview=1&token=T → drafts (T = short-lived preview JWT from admin)
Auth:
- GET  /api/auth/status        → { setup:bool, authed:bool }
- POST /api/auth/setup         → {password} first-run only, 400 if already set
- POST /api/auth/login         → {password}; rate-limited 5/15min/IP; sets httpOnly cookie (JWT 30min, sliding via middleware refresh)
- POST /api/auth/logout
- POST /api/auth/change-password → {current, next}
Admin content:
- GET    /api/admin/content            → full {draft,published,updatedAt} map
- PUT    /api/admin/content/:section   → body = full draft shape (autosave target)
- POST   /api/admin/content/:section/publish
- POST   /api/admin/content/:section/discard  → draft = published
- POST   /api/admin/publish-all
Media:
- POST   /api/admin/media   (multipart) → images auto-compressed via sharp (max 1920w, webp for images >200KB keep orig ext otherwise), returns {url:'/uploads/x', name, size, type}
- GET    /api/admin/media   → list
- DELETE /api/admin/media/:name
- POST   /api/admin/resume  (multipart pdf) → saves as /uploads/resume-<ts>.pdf, updates resume section draft+published
Misc:
- GET  /api/admin/activity
- GET  /api/admin/export    → full content.json download
- POST /api/admin/import    → replace content (validate shape keys)
- Every admin mutation appends activity entry.

Security headers on /api/admin/* and admin HTML: `X-Robots-Tag: noindex, nofollow`.
Unauthorized admin API → 401 JSON. Admin SPA route with bad/no auth → shows login (no redirect leak). Non-admin unknown SPA paths → portfolio home.

## Frontend integration rules
- `src/main.jsx`: BrowserRouter; route `${import.meta.env.VITE_ADMIN_ROUTE || '/admin-portal'}/*` → React.lazy(AdminApp); path `/*` → existing App unchanged.
- Public components read via ContentContext hook `useContent(section)` → returns published||seed. NO visual/markup changes to public site.
- seeds.js mirrors current hardcoded data EXACTLY (extract from components).
- Admin UI conventions: `.adm-` class prefix, dark theme matching site, toasts bottom-right, Confirm dialog for all deletes, autosave drafts debounced 800ms with "Saved" indicator, per-section Publish/Discard buttons, sticky sidebar nav, responsive (sidebar collapses <768px).
- RichText: light contentEditable with bold/italic/list/link buttons storing HTML; render on public with dangerouslySetInnerHTML ONLY for fields that previously held plain text rendered as paragraphs (about paragraphs, experience/project descriptions). Sanitize on server (strip <script on|javascript:).
- Drag order: HTML5 draggable on project rows + ↑↓ buttons fallback.
- Dev: vite.config proxy `/api`+`/uploads` → http://localhost:5174. Scripts: "server": "node server/index.js", "dev:all": "concurrently -k \"npm:server\" \"npm:dev\"". Prod: server serves ../dist statically + SPA fallback (admin route included), uploads static.
```
