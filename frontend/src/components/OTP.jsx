"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";

const COOLDOWN = 30;

export const OTP = ({ email, onVerified, onBack }) => {
  const { generateOtp, verifyOtp } = useUserStore();
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState(null);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const requested = useRef(false);

  const send = useCallback(async () => {
    setBusy(true);
    setError("");
    const res = await generateOtp(email);
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not send the code.");
      return;
    }
    setCode("");
    setDemoCode(res.demoOtp || null);
    setInfo(res.demoOtp ? "No email was sent in this mode. Use the code shown below." : `We sent a 6-digit code to ${email}.`);
    setCooldown(COOLDOWN);
  }, [email, generateOtp]);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    send();
  }, [send]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await verifyOtp(email, code);
    setBusy(false);
    if (res.success) onVerified(res.proof);
    else setError(res.message || "Invalid code.");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#3c6ca8]">Verify your email</h2>
      {info && <p className="text-sm text-[#3c6ca8]/80">{info}</p>}
      {demoCode && (
        <p className="p-3 rounded-lg bg-[#3c6ca8]/10 text-[#3c6ca8] text-center" data-testid="demo-otp">
          Demo code: <strong className="tracking-[0.3em] text-lg">{demoCode}</strong>
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="otp" className="sr-only">6-digit code</label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code"
          className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 text-center tracking-[0.4em] text-lg text-[#3c6ca8] bg-[#fffcf6] focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]"
        />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full bg-[#3c6ca8] hover:bg-[#2c5f8c] text-white py-3 rounded-lg font-semibold disabled:opacity-60">
          {busy ? "Checking…" : "Verify and continue"}
        </button>
      </form>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={onBack} className="text-[#3c6ca8] hover:underline">Back</button>
        <button type="button" onClick={send} disabled={busy || cooldown > 0} className="text-[#3c6ca8] hover:underline disabled:opacity-50 disabled:no-underline">
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
};
