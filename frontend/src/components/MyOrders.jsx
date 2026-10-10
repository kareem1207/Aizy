"use client";
import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { formatINR } from "@/lib/format";

export const MyOrders = () => {
  const getMyOrders = useOrderStore((s) => s.getMyOrders);
  const [state, setState] = useState({ loading: true, orders: [], error: "" });

  useEffect(() => {
    let live = true;
    getMyOrders().then((r) => {
      if (live) setState({ loading: false, orders: r.data || [], error: r.success ? "" : r.message });
    });
    return () => {
      live = false;
    };
  }, [getMyOrders]);

  return (
    <section className="mt-8" aria-label="My orders">
      <h3 className="text-xl font-semibold mb-4">My orders</h3>
      {state.loading ? (
        <p className="text-sm text-[#3c6ca8]/70">Loading…</p>
      ) : state.error ? (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      ) : state.orders.length === 0 ? (
        <p className="text-sm text-[#3c6ca8]/70">No orders yet. Add something to your cart and place a demo order.</p>
      ) : (
        <ul className="space-y-3">
          {state.orders.map((o) => (
            <li key={o.id} className="bg-white border border-[#3c6ca8]/10 rounded-lg p-4 text-sm" data-testid="order-row">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold">{o.id}</span>
                <span>{new Date(o.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <p className="text-gray-700 mt-1">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
              <p className="mt-1 flex justify-between"><span className="text-gray-500">{o.status}</span><strong>{formatINR(o.total)}</strong></p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
