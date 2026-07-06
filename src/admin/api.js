// Admin API fetch wrapper (per CMS-CONTRACT).
// - credentials: 'include' on every request (JWT httpOnly cookie)
// - JSON bodies by default, FormData passed through untouched
// - throws Error with { status, message } on non-2xx
// - dispatches window event 'adm:unauthed' on 401 so AdminApp can
//   drop back to the login screen.

// When the API lives on a different host than the admin UI (production:
// frontend on Vercel, backend on Render/Railway/Fly), set VITE_API_BASE to
// the backend URL. Empty in dev/local prod → relative same-origin paths.
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

// Prefix uploaded-media paths with the backend origin when the API is
// cross-origin. Leaves absolute URLs and non-upload paths untouched.
export function mediaSrc(url) {
  if (!url || typeof url !== "string") return url;
  return url.startsWith("/uploads/") ? API_BASE + url : url;
}

async function request(path, { method = "GET", body, headers } = {}) {
  const opts = { method, credentials: "include", headers: { ...headers } };

  if (body instanceof FormData) {
    opts.body = body; // browser sets the multipart boundary
  } else if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API_BASE + path, opts);
  } catch {
    const err = new Error("Network error — is the server running?");
    err.status = 0;
    throw err;
  }

  if (res.status === 401) {
    window.dispatchEvent(new Event("adm:unauthed"));
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      /* non-JSON error body — keep fallback message */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  const type = res.headers.get("content-type") || "";
  return type.includes("application/json") ? res.json() : res;
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
  request,
};

export { api };
export default api;
