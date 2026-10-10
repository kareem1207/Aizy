"use client";
import { useState } from "react";
import Link from "next/link";
import { IS_DEMO } from "@/lib/config";
import { TOKEN_KEY } from "@/lib/token";

export const DemoBanner = () => {
  const [busy, setBusy] = useState(false);
  if (!IS_DEMO) return null;

  const reset = async () => {
    setBusy(true);
    const { resetDemoDb } = await import("@/lib/demo/engine");
    await resetDemoDb();
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("aizy_cart_v1");
    } catch {}
    window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`);
  };

  return (
    <div role="status" className="bg-[#3c6ca8] text-white text-xs sm:text-sm">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <span>
          <strong>Live demo</strong> · sample data stored only in your browser · no payments are ever taken
        </span>
        <Link href="/login" className="underline underline-offset-2 hover:opacity-80">
          Try a demo account
        </Link>
        <button onClick={reset} disabled={busy} className="underline underline-offset-2 hover:opacity-80 disabled:opacity-60">
          {busy ? "Resetting…" : "Reset demo data"}
        </button>
      </div>
    </div>
  );
};
