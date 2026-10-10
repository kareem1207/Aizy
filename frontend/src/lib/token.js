// Minimal JWT payload helpers. The browser never verifies tokens (the server
// does); it only reads the payload to decide which UI to show.

const b64url = {
  enc: (s) =>
    btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  dec: (s) => {
    const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
    return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad)));
  },
};

export function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const part = token.split(".")[1];
    if (!part) return null;
    const payload = JSON.parse(b64url.dec(part));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Unsigned token used only by the in-browser demo backend. */
export function makeDemoToken(payload, ttlSeconds = 60 * 60 * 24) {
  const body = { ...payload, iat: Math.floor(Date.now() / 1000) };
  body.exp = body.iat + ttlSeconds;
  return `${b64url.enc(JSON.stringify({ alg: "none", typ: "DEMO" }))}.${b64url.enc(JSON.stringify(body))}.demo`;
}

export const TOKEN_KEY = "user_login_token";

export function getStoredToken() {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
