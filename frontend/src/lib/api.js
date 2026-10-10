import { AI_URL, BACKEND_URL, IS_DEMO } from "./config";
import { getStoredToken } from "./token";

/** fetch() that is routed to the in-browser demo backend when running in demo mode. */
export async function apiFetch(path, init = {}) {
  if (IS_DEMO) {
    const { demoFetch } = await import("./demo/engine");
    return demoFetch(path, init);
  }
  const base = path.startsWith("/ai") ? AI_URL : BACKEND_URL;
  return fetch(`${base}${path}`, init);
}

/**
 * JSON request helper. Never throws: resolves to { ok, status, data, message }
 * where `data` is the parsed body (or {} if the body was not JSON).
 */
export async function request(path, { method = "GET", body, auth = false, timeoutMs = 60000, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getStoredToken();
    if (!token) return { ok: false, status: 401, data: {}, message: "Authentication required" };
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const res = await apiFetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* non-JSON body */
    }
    const failed = !res.ok || data.success === false;
    return {
      ok: !failed,
      status: res.status,
      data,
      message: data.message || data.detail || (failed ? `Error: ${res.status} ${res.statusText || ""}`.trim() : ""),
    };
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "The request timed out. Please try again."
        : IS_DEMO
          ? "Something went wrong in demo mode."
          : `Cannot connect to the server at ${BACKEND_URL}. Is the backend running?`;
    return { ok: false, status: 0, data: {}, message };
  } finally {
    clearTimeout(timer);
  }
}
