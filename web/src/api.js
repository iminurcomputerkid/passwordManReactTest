// Default to the Azure API base. Override with VITE_API_BASE if needed.
const DEFAULT_BASE = "https://pwmanapi-ekc3g3g6gcfwfxgr.canadacentral-01.azurewebsites.net/api";
const RAW_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_BASE).trim();

// Normalize to an absolute base URL so URL construction never fails.
// If RAW_BASE is relative (e.g., "/api"), prepend window.location.origin.
const BASE =
  RAW_BASE.startsWith("http://") || RAW_BASE.startsWith("https://")
    ? RAW_BASE.replace(/\/+$/, "") + "/"
    : `${window.location.origin}${RAW_BASE.replace(/\/+$/, "")}/`;

function buildHeaders(authRequired, extraHeaders = {}) {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  const token = sessionStorage.getItem("sessionToken");
  if (authRequired && token) {
    headers["X-Session-Token"] = token;
  }
  return headers;
}

async function request(path, { method = "GET", authRequired = true, body, params } = {}) {
  const cleanPath = `${path}`.replace(/^\//, "");
  const url = new URL(cleanPath, BASE);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, val);
      }
    });
  }

  const res = await fetch(url, {
    method,
    headers: buildHeaders(authRequired),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail = typeof data === "object" && data !== null ? data.detail || data.message || data : data;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

export function apiGet(path, params, opts = {}) {
  return request(path, { method: "GET", params, ...opts });
}

export function apiPost(path, body, opts = {}) {
  return request(path, { method: "POST", body, ...opts });
}

export function apiDelete(path, body, opts = {}) {
  return request(path, { method: "DELETE", body, ...opts });
}
export const apiBase = BASE.replace(/\/$/, "");
