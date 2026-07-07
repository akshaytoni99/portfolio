import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "./api.js";
import { seeds } from "../content/seeds.js";
import { ToastProvider, useToast } from "./components/Toast.jsx";
import { ConfirmProvider, useConfirm } from "./components/Confirm.jsx";
import "./admin.css";

import HeroEditor from "./sections/HeroEditor.jsx";
import AboutEditor from "./sections/AboutEditor.jsx";
import ExperienceEditor from "./sections/ExperienceEditor.jsx";
import ProjectsEditor from "./sections/ProjectsEditor.jsx";
import SkillsEditor from "./sections/SkillsEditor.jsx";
import CertificationsEditor from "./sections/CertificationsEditor.jsx";
import EducationEditor from "./sections/EducationEditor.jsx";
import TestimonialsEditor from "./sections/TestimonialsEditor.jsx";
import ContactEditor from "./sections/ContactEditor.jsx";
import ResumeEditor from "./sections/ResumeEditor.jsx";
import SeoEditor from "./sections/SeoEditor.jsx";
import ThemeEditor from "./sections/ThemeEditor.jsx";
import MediaManager from "./sections/MediaManager.jsx";

// tool: true → not a content.json section (no draft/publish lifecycle)
const NAV = [
  { key: "hero", label: "Hero", Editor: HeroEditor },
  { key: "about", label: "About", Editor: AboutEditor },
  { key: "experience", label: "Experience", Editor: ExperienceEditor },
  { key: "projects", label: "Projects", Editor: ProjectsEditor },
  { key: "skills", label: "Skills", Editor: SkillsEditor },
  { key: "certifications", label: "Certifications", Editor: CertificationsEditor },
  { key: "education", label: "Education", Editor: EducationEditor },
  { key: "testimonials", label: "Testimonials", Editor: TestimonialsEditor },
  { key: "contact", label: "Contact", Editor: ContactEditor },
  { key: "resume", label: "Resume", Editor: ResumeEditor },
  { key: "seo", label: "SEO", Editor: SeoEditor },
  { key: "theme", label: "Theme", Editor: ThemeEditor },
  { key: "media", label: "Media", Editor: MediaManager, tool: true },
  { key: "activity", label: "Activity", tool: true },
  { key: "settings", label: "Settings", tool: true },
];

const CONTENT_SECTIONS = NAV.filter((s) => !s.tool);

function labelOf(key) {
  return NAV.find((s) => s.key === key)?.label || key;
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count += 1;
    idx += needle.length;
  }
  return count;
}

/* ── Auth screens ─────────────────────────────────────────────── */

function SetupScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/setup", { password });
      await api.post("/api/auth/login", { password });
      onDone();
    } catch (err) {
      setError(err.message || "Setup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-root adm-center">
      <form className="adm-auth-card" onSubmit={submit}>
        <div className="adm-logo">
          Admin<span className="adm-logo-dot">.</span>
        </div>
        <h1 className="adm-auth-title">First-time setup</h1>
        <p className="adm-auth-sub">Create the admin password for this portfolio.</p>
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-setup-pw">Password</label>
          <input
            id="adm-setup-pw"
            className="adm-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoFocus
          />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-setup-pw2">Confirm password</label>
          <input
            id="adm-setup-pw2"
            className="adm-input"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Repeat password"
          />
        </div>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary adm-btn-block" type="submit" disabled={busy}>
          {busy ? "Setting up…" : "Create password"}
        </button>
      </form>
    </div>
  );
}

function LoginScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/auth/login", { password });
      onDone();
    } catch (err) {
      if (err.status === 429) {
        setError("Too many attempts. Please wait 15 minutes and try again.");
      } else if (err.status === 401) {
        setError("Incorrect password.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-root adm-center">
      <form className="adm-auth-card" onSubmit={submit}>
        <div className="adm-logo">
          Admin<span className="adm-logo-dot">.</span>
        </div>
        <h1 className="adm-auth-title">Welcome back</h1>
        <p className="adm-auth-sub">Enter your password to manage the portfolio.</p>
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-login-pw">Password</label>
          <input
            id="adm-login-pw"
            className="adm-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
        </div>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary adm-btn-block" type="submit" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ── Save indicator ───────────────────────────────────────────── */

function SaveIndicator({ state }) {
  if (!state) return null;
  if (state === "pending") return <span className="adm-save adm-save-pending">Unsaved changes…</span>;
  if (state === "saving") return <span className="adm-save adm-save-saving">Saving…</span>;
  if (state === "error") return <span className="adm-save adm-save-error">Save failed</span>;
  return <span className="adm-save adm-save-saved">Saved</span>;
}

/* ── Activity panel (log + export/import) ─────────────────────── */

function ActivityPanel({ onImported }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(() => {
    api
      .get("/api/admin/activity")
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.status !== 401) toast(err.message, "error");
      });
  }, [toast]);

  useEffect(load, [load]);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = await confirm({
      title: "Import content?",
      message: `Replace ALL content (drafts and published) with "${file.name}"? This cannot be undone.`,
      confirmLabel: "Import",
      danger: true,
    });
    if (!ok) return;
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        const err = new Error("File is not valid JSON.");
        err.status = 400;
        throw err;
      }
      await api.post("/api/admin/import", data);
      toast("Content imported");
      load();
      onImported?.();
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  // A bare <a href="/api/admin/export"> would resolve against the frontend
  // origin (not VITE_API_BASE) and carry no cross-site auth cookie — broken in
  // the split-host deploy. Fetch through the API wrapper and download a blob.
  const handleExport = async () => {
    try {
      const res = await api.request("/api/admin/export");
      const payload = res instanceof Response ? await res.blob() : new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(payload);
      const a = document.createElement("a");
      a.href = url;
      a.download = "content.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-section-head">
        <div>
          <h2 className="adm-section-title">Activity</h2>
          <span className="adm-section-meta">Recent admin actions, most recent first.</span>
        </div>
        <div className="adm-section-actions">
          <button type="button" className="adm-btn adm-btn-outline" onClick={handleExport}>
            Export
          </button>
          <button type="button" className="adm-btn adm-btn-outline" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="adm-hidden-input"
            onChange={handleImport}
          />
        </div>
      </div>

      {rows === null ? (
        <div className="adm-spinner" />
      ) : rows.length === 0 ? (
        <div className="adm-card adm-empty">No activity yet.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Section</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row.ts}-${i}`}>
                  <td className="adm-nowrap">{formatTime(row.ts)}</td>
                  <td><span className="adm-chip">{row.action}</span></td>
                  <td>{row.section || "—"}</td>
                  <td className="adm-detail-cell">{row.detail || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Settings panel (change password) ─────────────────────────── */

function SettingsPanel() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/change-password", { current, next });
      toast("Password changed");
      setCurrent("");
      setNext("");
    } catch (err) {
      setError(err.status === 401 || err.status === 400 ? "Current password is incorrect." : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-section-head">
        <div>
          <h2 className="adm-section-title">Settings</h2>
          <span className="adm-section-meta">Change the admin password.</span>
        </div>
      </div>
      <form className="adm-card adm-settings-form" onSubmit={submit}>
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-pw-current">Current password</label>
          <input
            id="adm-pw-current"
            className="adm-input"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-pw-next">New password</label>
          <input
            id="adm-pw-next"
            className="adm-input"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
        </div>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-primary" type="submit" disabled={busy || !current || !next}>
          {busy ? "Changing…" : "Change password"}
        </button>
      </form>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */

function Dashboard({ onLogout }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [content, setContent] = useState(null);
  const [active, setActive] = useState("hero");
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState({});
  const [publishedAt, setPublishedAt] = useState({});
  const [navOpen, setNavOpen] = useState(false);
  const timersRef = useRef({});
  const draftsRef = useRef({});
  const savingRef = useRef({}); // in-flight PUT promise per section

  const loadContent = useCallback(async () => {
    try {
      const map = await api.get("/api/admin/content");
      setContent(map && typeof map === "object" ? map : {});
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  }, [toast]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const saveDraft = useCallback(
    async (key, draft) => {
      setSaveState((s) => ({ ...s, [key]: "saving" }));
      const p = (async () => {
        try {
          await api.put(`/api/admin/content/${key}`, draft);
          setSaveState((s) => ({ ...s, [key]: "saved" }));
        } catch (err) {
          setSaveState((s) => ({ ...s, [key]: "error" }));
          if (err.status !== 401) toast(`Autosave failed: ${err.message}`, "error");
        } finally {
          if (savingRef.current[key] === p) delete savingRef.current[key];
        }
      })();
      savingRef.current[key] = p;
      return p;
    },
    [toast]
  );

  // AUTOSAVE: debounce 800ms per section
  const handleChange = useCallback(
    (key, nextDraft) => {
      draftsRef.current[key] = nextDraft;
      setContent((c) => ({ ...c, [key]: { ...(c?.[key] || {}), draft: nextDraft } }));
      setSaveState((s) => ({ ...s, [key]: "pending" }));
      clearTimeout(timersRef.current[key]);
      timersRef.current[key] = setTimeout(() => {
        delete timersRef.current[key];
        saveDraft(key, draftsRef.current[key]);
      }, 800);
    },
    [saveDraft]
  );

  // Flush a pending debounced save AND any in-flight PUT (publish must never
  // race an autosave and promote a stale draft).
  const flushSave = useCallback(
    async (key) => {
      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
        delete timersRef.current[key];
        await saveDraft(key, draftsRef.current[key]);
      } else if (savingRef.current[key]) {
        await savingRef.current[key];
      }
    },
    [saveDraft]
  );

  // On unmount (logout, auth-drop) fire any pending debounced saves so the
  // last edit is not silently lost with the cancelled timer.
  useEffect(() => {
    return () => {
      for (const key of Object.keys(timersRef.current)) {
        clearTimeout(timersRef.current[key]);
        delete timersRef.current[key];
        const draft = draftsRef.current[key];
        if (draft !== undefined) saveDraft(key, draft);
      }
    };
  }, [saveDraft]);

  const publishSection = async (key) => {
    try {
      await flushSave(key);
      // Use the server's post-publish entry as truth instead of guessing.
      const entry = await api.post(`/api/admin/content/${key}/publish`);
      if (entry && typeof entry === "object" && "published" in entry) {
        setContent((c) => ({ ...c, [key]: entry }));
        if (entry.published == null) {
          toast(`${labelOf(key)} has no draft yet — edit it first, then publish`, "error");
          return;
        }
      }
      setPublishedAt((p) => ({ ...p, [key]: new Date().toISOString() }));
      toast(`${labelOf(key)} published`);
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  const discardSection = async (key) => {
    const ok = await confirm({
      title: `Discard ${labelOf(key)} draft?`,
      message: "Unsaved changes will be lost and the draft will revert to the last published version.",
      confirmLabel: "Discard",
      danger: true,
    });
    if (!ok) return;
    clearTimeout(timersRef.current[key]);
    delete timersRef.current[key];
    try {
      await api.post(`/api/admin/content/${key}/discard`);
      setContent((c) => ({
        ...c,
        [key]: { ...(c?.[key] || {}), draft: c?.[key]?.published ?? null },
      }));
      setSaveState((s) => ({ ...s, [key]: undefined }));
      toast(`${labelOf(key)} draft discarded`);
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  const publishAll = async () => {
    try {
      await Promise.all(CONTENT_SECTIONS.map((s) => flushSave(s.key)));
      const res = await api.post("/api/admin/publish-all");
      const publishedKeys = Array.isArray(res?.published) ? res.published : [];
      const now = new Date().toISOString();
      setPublishedAt((p) => {
        const nextP = { ...p };
        for (const key of publishedKeys) nextP[key] = now;
        return nextP;
      });
      await loadContent(); // resync local state with the server's truth
      toast(
        publishedKeys.length
          ? `Published: ${publishedKeys.join(", ")}`
          : "Nothing to publish — no edited sections"
      );
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  const openPreview = async () => {
    try {
      const res = await api.post("/api/auth/preview-token");
      const t = res?.token || res?.previewToken || "";
      window.open("/?preview=1&token=" + encodeURIComponent(t), "_blank", "noopener");
    } catch (err) {
      if (err.status !== 401) toast(err.message, "error");
    }
  };

  const logout = async () => {
    // Flush pending edits first — logout unmounts the dashboard and would
    // otherwise cancel the debounced autosave, silently losing the last edit.
    try {
      await Promise.all(CONTENT_SECTIONS.map((s) => flushSave(s.key)));
    } catch {
      /* best effort */
    }
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* clear client state regardless */
    }
    onLogout();
  };

  // Global search: filters nav by label + deep-searches draft JSON,
  // with a match count badge per section.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const map = {};
    for (const s of NAV) {
      let count = 0;
      if (s.label.toLowerCase().includes(q)) count += 1;
      if (!s.tool) {
        const draft = content?.[s.key]?.draft;
        if (draft != null) {
          count += countOccurrences(JSON.stringify(draft).toLowerCase(), q);
        }
      }
      if (count > 0) map[s.key] = count;
    }
    return map;
  }, [query, content]);

  const visibleNav = matches ? NAV.filter((s) => matches[s.key] !== undefined) : NAV;
  const section = NAV.find((s) => s.key === active) || NAV[0];
  const meta = content?.[section.key];

  let panel;
  if (section.key === "activity") {
    panel = <ActivityPanel onImported={loadContent} />;
  } else if (section.key === "settings") {
    panel = <SettingsPanel />;
  } else if (section.key === "media") {
    panel = (
      <div className="adm-panel">
        <div className="adm-section-head">
          <div>
            <h2 className="adm-section-title">Media</h2>
            <span className="adm-section-meta">Upload and manage images and files.</span>
          </div>
        </div>
        <MediaManager draft={null} onChange={() => {}} />
      </div>
    );
  } else if (content === null) {
    panel = <div className="adm-spinner" />;
  } else {
    const Editor = section.Editor;
    panel = (
      <div className="adm-panel">
        <div className="adm-section-head">
          <div>
            <h2 className="adm-section-title">{section.label}</h2>
            <span className="adm-section-meta">
              {meta?.published
                ? publishedAt[section.key]
                  ? `Last published ${formatTime(publishedAt[section.key])}`
                  : "Published"
                : "Never published"}
            </span>
          </div>
          <div className="adm-section-actions">
            <SaveIndicator state={saveState[section.key]} />
            <button type="button" className="adm-btn adm-btn-ghost" onClick={() => discardSection(section.key)}>
              Discard
            </button>
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => publishSection(section.key)}>
              Publish
            </button>
          </div>
        </div>
        <Editor
          draft={meta?.draft ?? meta?.published ?? seeds[section.key] ?? null}
          onChange={(nextDraft) => handleChange(section.key, nextDraft)}
        />
      </div>
    );
  }

  return (
    <div className="adm-root adm-shell">
      <aside className={`adm-sidebar ${navOpen ? "adm-sidebar-open" : ""}`}>
        <div className="adm-logo">
          Admin<span className="adm-logo-dot">.</span>
        </div>
        <nav className="adm-nav">
          {visibleNav.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`adm-nav-item ${active === s.key ? "adm-nav-active" : ""}`}
              onClick={() => {
                setActive(s.key);
                setNavOpen(false);
              }}
            >
              <span>{s.label}</span>
              {matches && <span className="adm-nav-count">{matches[s.key]}</span>}
            </button>
          ))}
          {matches && visibleNav.length === 0 && <p className="adm-nav-empty">No matches</p>}
        </nav>
      </aside>
      {navOpen && <div className="adm-scrim" onClick={() => setNavOpen(false)} />}

      <div className="adm-main">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-burger"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <input
            className="adm-input adm-search"
            type="search"
            placeholder="Search sections & content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="adm-topbar-actions">
            <button type="button" className="adm-btn adm-btn-outline" onClick={openPreview}>
              Preview
            </button>
            <button type="button" className="adm-btn adm-btn-primary" onClick={publishAll}>
              Publish All
            </button>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <main className="adm-content">{panel}</main>
      </div>
    </div>
  );
}

/* ── Root: auth gate ──────────────────────────────────────────── */

function AdminRoot() {
  const [view, setView] = useState("loading"); // loading | setup | login | dashboard

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/auth/status")
      .then((s) => {
        if (cancelled) return;
        if (!s.setup) setView("setup");
        else if (s.authed) setView("dashboard");
        else setView("login");
      })
      .catch(() => {
        if (!cancelled) setView("login");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // api.js dispatches 'adm:unauthed' on any 401 → drop back to login
  useEffect(() => {
    const onUnauthed = () => setView((v) => (v === "dashboard" ? "login" : v));
    window.addEventListener("adm:unauthed", onUnauthed);
    return () => window.removeEventListener("adm:unauthed", onUnauthed);
  }, []);

  if (view === "loading") {
    return (
      <div className="adm-root adm-center">
        <div className="adm-spinner" />
      </div>
    );
  }
  if (view === "setup") return <SetupScreen onDone={() => setView("dashboard")} />;
  if (view === "login") return <LoginScreen onDone={() => setView("dashboard")} />;
  return <Dashboard onLogout={() => setView("login")} />;
}

export default function AdminApp() {
  // Keep the admin SPA out of search indexes
  useEffect(() => {
    const metaTag = document.createElement("meta");
    metaTag.name = "robots";
    metaTag.content = "noindex,nofollow";
    document.head.appendChild(metaTag);
    const prevTitle = document.title;
    document.title = "Admin";
    return () => {
      document.head.removeChild(metaTag);
      document.title = prevTitle;
    };
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminRoot />
      </ConfirmProvider>
    </ToastProvider>
  );
}
