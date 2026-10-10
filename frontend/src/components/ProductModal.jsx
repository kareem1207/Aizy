"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import { formatINR } from "@/lib/format";

const formatDate = (s) => {
  if (!s) return "N/A";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "N/A" : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(d);
};

export const ProductModal = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const out = product.count <= 0;
  const max = Math.min(20, product.count);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const add = () => {
    const res = useCartStore.getState().add(product, qty);
    if (res.success) {
      toast.success(`${qty} × ${product.name} added to cart`);
      onClose();
    } else toast.error(res.message);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#fffcf6] w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl grid sm:grid-cols-2">
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-[#3c6ca8] shadow hover:bg-white">✕</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="w-full h-56 sm:h-full object-cover bg-gray-100" />
        <div className="p-5 sm:p-6 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-[#3c6ca8]/70">{product.category}</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{product.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>★ {product.rating ? Number(product.rating).toFixed(1) : "New"}</span>
            <span aria-hidden>·</span>
            <span>Sold by {product.sellersName || "Aizy"}</span>
          </div>
          <p className="text-2xl font-bold text-[#3c6ca8]">{formatINR(product.price)}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{product.description || product.shortDescription || "No description yet."}</p>
          <p className="text-xs text-gray-500">Listed {formatDate(product.createdAt)} · {out ? "Out of stock" : `${product.count} in stock`}</p>

          <div className="mt-auto pt-3 flex items-center gap-3">
            <div className="flex items-center border border-[#3c6ca8]/30 rounded-lg">
              <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={out} className="w-9 h-10 text-[#3c6ca8] disabled:opacity-40">−</button>
              <span className="w-8 text-center" data-testid="modal-qty">{out ? 0 : qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={out || qty >= max} className="w-9 h-10 text-[#3c6ca8] disabled:opacity-40">+</button>
            </div>
            <button onClick={add} disabled={out} className="flex-1 py-2.5 rounded-lg bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c] disabled:bg-gray-300 disabled:cursor-not-allowed">
              {out ? "Unavailable" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
