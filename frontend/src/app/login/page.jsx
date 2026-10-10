"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OTP } from "@/components/OTP";
import { useUserStore } from "@/store/userStore";
import { IS_DEMO } from "@/lib/config";
import { DEMO_PASSWORD } from "@/lib/demo/seed";

const DEMO_ACCOUNTS = [
  { role: "customer", email: "customer@aizy.demo", blurb: "Browse, chat with the stylist, place demo orders" },
  { role: "seller", email: "seller@aizy.demo", blurb: "Manage products and see sales forecasts" },
  { role: "admin", email: "admin@aizy.demo", blurb: "Manage users, bans and admins" },
];

const field =
  "w-full px-4 py-3.5 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 placeholder-[#3c6ca8]/60";

const Login = () => {
  const router = useRouter();
  const { loginUser, createUser } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", userType: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needOtp, setNeedOtp] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const switchMode = (login) => {
    setIsLogin(login);
    setError("");
    setNeedOtp(false);
  };

  const finish = async (creds, signup) => {
    setLoading(true);
    setError("");
    const result = signup ? await createUser(creds) : await loginUser(creds);
    if (!result.success) {
      setLoading(false);
      setNeedOtp(false);
      setError(
        result.reason
          ? `${result.message}. Reason: ${result.reason}${result.bannedUntil ? ` (until ${new Date(result.bannedUntil).toLocaleDateString()})` : ""}`
          : result.message
      );
      return;
    }
    router.push("/");
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!isLogin) {
      if (form.password.length < 8) return setError("Password must be at least 8 characters");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match");
      setNeedOtp(true);
      return;
    }
    finish(form, false);
  };

  const quick = (a) => finish({ email: a.email, password: DEMO_PASSWORD, userType: a.role }, false);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#fffcf6] p-6 sm:p-8">
      <div className="w-full max-w-md">
        <h1 className="text-center text-6xl font-black text-[#3c6ca8] tracking-[0.1em] mb-8" style={{ textShadow: "2px 2px 4px rgba(60,108,168,.3)" }}>
          AIZY
        </h1>

        <div className="bg-white/60 rounded-xl p-6 border border-[#3c6ca8]/20 shadow-sm">
          <div className="flex mb-6 bg-[#3c6ca8]/10 rounded-md p-1" role="tablist">
            {[["Login", true], ["Sign Up", false]].map(([label, val]) => (
              <button key={label} role="tab" aria-selected={isLogin === val} onClick={() => switchMode(val)} className={`flex-1 py-2 rounded-sm transition-all ${isLogin === val ? "bg-[#3c6ca8] text-white" : "text-[#3c6ca8]"}`}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {needOtp ? (
            <OTP email={form.email} onBack={() => setNeedOtp(false)} onVerified={(proof) => finish({ ...form, proof }, true)} />
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate={false}>
              {!isLogin && (
                <input type="text" name="name" aria-label="Name" placeholder="Name" value={form.name} onChange={change} className={field} required maxLength={80} disabled={loading} />
              )}
              <input type="email" name="email" aria-label="Email" placeholder="Email" value={form.email} onChange={change} className={field} required disabled={loading} autoComplete="email" />
              <input type="password" name="password" aria-label="Password" placeholder={isLogin ? "Password" : "Password (8+ characters)"} value={form.password} onChange={change} className={field} required disabled={loading} autoComplete={isLogin ? "current-password" : "new-password"} />
              {!isLogin && (
                <input type="password" name="confirmPassword" aria-label="Confirm password" placeholder="Confirm password" value={form.confirmPassword} onChange={change} className={field} required disabled={loading} autoComplete="new-password" />
              )}
              <select name="userType" aria-label="Account type" value={form.userType} onChange={change} className={field} disabled={loading}>
                <option value="customer">Customer</option>
                {isLogin && <option value="admin">Admin</option>}
                <option value="seller">Seller</option>
              </select>
              <button type="submit" disabled={loading} className="w-full bg-[#3c6ca8] hover:bg-[#2c5f8c] text-white py-3 rounded-md font-semibold disabled:opacity-70">
                {loading ? "Please wait…" : isLogin ? "Log in" : "Continue"}
              </button>
            </form>
          )}
        </div>

        {IS_DEMO && !needOtp && (
          <div className="mt-6 bg-white/60 rounded-xl p-5 border border-[#3c6ca8]/20" data-testid="demo-accounts">
            <p className="font-semibold text-[#3c6ca8] mb-1">Just looking around?</p>
            <p className="text-sm text-[#3c6ca8]/80 mb-3">One click signs you into a demo account. Nothing leaves your browser.</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.role} onClick={() => quick(a)} disabled={loading} className="w-full text-left px-4 py-2.5 rounded-lg border border-[#3c6ca8]/30 hover:bg-[#3c6ca8]/10 disabled:opacity-60">
                  <span className="font-medium text-[#3c6ca8] capitalize">Continue as {a.role}</span>
                  <span className="block text-xs text-gray-500">{a.blurb}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Or type them in: <code>{DEMO_ACCOUNTS[0].email}</code>, password <code>{DEMO_PASSWORD}</code>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Login;
