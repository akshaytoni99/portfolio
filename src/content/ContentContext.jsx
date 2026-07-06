import { createContext, useContext, useEffect, useState } from "react";
import { seeds } from "./seeds";

const ContentContext = createContext(seeds);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Merge published fields over the seed shape. null/undefined published fields
// fall back to the seed; arrays replace wholesale.
function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override ?? base;
  }
  const merged = { ...base };
  for (const key of Object.keys(override)) {
    const value = override[key];
    if (value === null || value === undefined) continue;
    merged[key] =
      isPlainObject(value) && isPlainObject(base[key])
        ? deepMerge(base[key], value)
        : value;
  }
  return merged;
}

const THEME_VARS = {
  primary: "--color-primary",
  accent: "--color-accent",
  background: "--color-background",
};

export function ContentProvider({ children }) {
  const [content, setContent] = useState(seeds);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("preview") === "1" ? params.get("token") : null;
    const url = token
      ? `/api/content?preview=1&token=${encodeURIComponent(token)}`
      : "/api/content";

    let cancelled = false;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !isPlainObject(data)) return;
        setContent((prev) => {
          const next = { ...prev };
          for (const section of Object.keys(seeds)) {
            if (data[section] != null) {
              next[section] = deepMerge(seeds[section], data[section]);
            }
          }
          return next;
        });
      })
      .catch(() => {
        // Offline / static hosting / no server — seeds only.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply theme overrides as CSS vars on the document root (vars live in index.css).
  useEffect(() => {
    const root = document.documentElement;
    const theme = content.theme ?? seeds.theme;
    for (const [key, cssVar] of Object.entries(THEME_VARS)) {
      if (theme[key] && theme[key] !== seeds.theme[key]) {
        root.style.setProperty(cssVar, theme[key]);
      } else {
        root.style.removeProperty(cssVar);
      }
    }
  }, [content.theme]);

  // Apply SEO title/description from content.
  useEffect(() => {
    const seo = content.seo ?? seeds.seo;
    if (seo.title) {
      document.title = seo.title;
    }
    if (seo.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", seo.description);
    }
  }, [content.seo]);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(section) {
  const content = useContext(ContentContext);
  return content[section] ?? seeds[section];
}
