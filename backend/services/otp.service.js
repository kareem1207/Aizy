import crypto from "node:crypto";
import { env } from "../config/env.js";

const TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 30 * 1000;
const MAX_TRIES = 5;

// Single-process store. Running several instances needs a shared store (e.g. Redis).
const pending = new Map();

const digest = (email, code) =>
  crypto.createHmac("sha256", env.jwtSecret).update(`${email}:${code}`).digest("hex");

export function issueOtp(email) {
  const existing = pending.get(email);
  if (existing && Date.now() - existing.sentAt < RESEND_GAP_MS) {
    return { error: "too_soon", retryInSeconds: Math.ceil((RESEND_GAP_MS - (Date.now() - existing.sentAt)) / 1000) };
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  pending.set(email, { hash: digest(email, code), exp: Date.now() + TTL_MS, tries: 0, sentAt: Date.now() });
  return { code };
}

export function checkOtp(email, code) {
  const rec = pending.get(email);
  if (!rec || rec.exp < Date.now()) {
    pending.delete(email);
    return { error: "expired" };
  }
  rec.tries += 1;
  if (rec.tries > MAX_TRIES) {
    pending.delete(email);
    return { error: "locked" };
  }
  const given = Buffer.from(digest(email, String(code)));
  const want = Buffer.from(rec.hash);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) return { error: "wrong" };
  pending.delete(email);
  return { ok: true };
}

export const _resetOtps = () => pending.clear();
