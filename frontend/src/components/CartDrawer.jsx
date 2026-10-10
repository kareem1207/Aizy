"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatINR } from "@/lib/format";
import { decodeToken, getStoredToken } from "@/lib/token";
import { IS_DEMO } from "@/lib/config";

export const CartDrawer = () => {
  const router = useRouter();
  const { items, open, setOpen, setQty, remove, checkout } = useCartStore();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [placed, setPlaced] = useState(null);

  if (!open) return null;
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);

  const close = () => {
    setOpen(false);
    setMsg(null);
    setPlaced(null);
  };

  const place = async () => {
    const me = decodeToken(getStoredToken());
    if (!me) {
      close();
      router.push("/login");
      return;
    }
    if (me.role !== "customer") {
      setMsg({ type: "error", text: "Sign in with a customer account to place orders." });
      return;
    }
    setBusy(true);
    const res = await checkout();
    setBusy(false);
    if (res.success) setPlaced(res.order);
    else setMsg({ type: "error", text: res.message });
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#fffcf6] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c6ca8]/15">
          <h2 className="text-lg font-semibold text-[#3c6ca8]">Your cart</h2>
          <button onClick={close} aria-label="Close cart" className="p-2 rounded-full hover:bg-[#3c6ca8]/10 text-[#3c6ca8]">✕</button>
        </div>

        {placed ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-semibold text-[#3c6ca8]" data-testid="order-id">Order {placed.id} placed</h3>
            <p className="text-gray-600 text-sm">
              {formatINR(placed.total)} · {IS_DEMO ? "demo order, no payment was taken." : "payment is not collected online yet."}
            </p>
            <button onClick={close} className="mt-2 px-5 py-2 rounded-lg bg-[#3c6ca8] text-white hover:bg-[#2c5f8c]">Keep shopping</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-2 text-[#3c6ca8]/70">
            <div className="text-5xl">🛒</div>
            <p className="font-medium">Your cart is empty</p>
            <button onClick={close} className="mt-2 text-sm underline">Browse products</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-[#3c6ca8]/10 px-5">
              {items.map((i) => (
                <li key={i._id} className="py-4 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{i.name}</p>
                    <p className="text-sm text-[#3c6ca8] font-semibold">{formatINR(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label={`Decrease ${i.name}`} onClick={() => setQty(i._id, i.qty - 1)} className="w-7 h-7 rounded border border-[#3c6ca8]/30 text-[#3c6ca8] hover:bg-[#3c6ca8]/10">−</button>
                      <span className="w-6 text-center text-sm" data-testid={`qty-${i._id}`}>{i.qty}</span>
                      <button aria-label={`Increase ${i.name}`} onClick={() => setQty(i._id, i.qty + 1)} disabled={i.qty >= i.max} className="w-7 h-7 rounded border border-[#3c6ca8]/30 text-[#3c6ca8] hover:bg-[#3c6ca8]/10 disabled:opacity-40">+</button>
                      <button onClick={() => remove(i._id)} className="ml-auto text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 py-4 border-t border-[#3c6ca8]/15 space-y-3">
              {msg && <p role="alert" className="text-sm text-red-600">{msg.text}</p>}
              <div className="flex justify-between text-[#3c6ca8] font-semibold">
                <span>Total</span>
                <span data-testid="cart-total">{formatINR(total)}</span>
              </div>
              <button onClick={place} disabled={busy} className="w-full py-3 rounded-lg bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c] disabled:opacity-60">
                {busy ? "Placing order…" : IS_DEMO ? "Place demo order" : "Place order"}
              </button>
              <p className="text-xs text-gray-500 text-center">No payment is collected. Orders only update stock and the seller forecast.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
