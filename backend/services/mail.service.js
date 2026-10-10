import { env } from "../config/env.js";

const html = (code) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e1e1e1;border-radius:8px;background:#fffcf6">
  <h1 style="color:#3c6ca8;font-size:22px;margin:0 0 12px">Verify your email</h1>
  <p style="color:#444;font-size:15px;line-height:1.5">Use this one-time code to finish creating your Aizy account:</p>
  <p style="background:#f5f5f5;padding:14px;border-radius:6px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#3c6ca8">${code}</p>
  <p style="color:#666;font-size:13px">The code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
</div>`;

/**
 * Sends the OTP through Resend when RESEND_API_KEY is set.
 * Returns { delivered: true } or { delivered: false, reason }.
 */
export async function sendOtpMail(to, code) {
  if (!env.resendApiKey) return { delivered: false, reason: "not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.mailFrom, to, subject: "Your Aizy verification code", html: html(code) }),
    });
    if (!res.ok) return { delivered: false, reason: `provider_${res.status}` };
    return { delivered: true };
  } catch {
    return { delivered: false, reason: "network" };
  }
}
