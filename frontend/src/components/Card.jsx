"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import { formatINR } from "@/lib/format";
import { ProductModal } from "./ProductModal";

const Stars = ({ value }) => (
  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700" aria-label={`Rated ${value || "not yet"} out of 5`}>
    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    {value ? Number(value).toFixed(1) : "New"}
  </span>
);

export const addToCartWithToast = (product, qty = 1) => {
  const res = useCartStore.getState().add(product, qty);
  if (res.success) toast.success(`${product.name} added to cart`);
  else toast.error(res.message || "Could not add to cart");
  return res;
};

export const Card = ({ card }) => {
  const [selected, setSelected] = useState(null);
  if (!card) return null;

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5" data-testid="product-grid">
        {card.map((item) => {
          const out = item.count <= 0;
          const low = !out && item.count <= 5;
          return (
            <li key={item._id} className="group relative bg-white rounded-2xl border border-[#3c6ca8]/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="text-left flex-1 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c6ca8]"
                aria-label={`View ${item.name}`}
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {(out || low) && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${out ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                      {out ? "Out of stock" : `Only ${item.count} left`}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-[#3c6ca8]/70 truncate">{item.category}</p>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-bold text-[#3c6ca8]">{formatINR(item.price)}</span>
                    <Stars value={item.rating} />
                  </div>
                </div>
              </button>
              <div className="px-3 pb-3">
                <button
                  type="button"
                  disabled={out}
                  onClick={() => addToCartWithToast(item)}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-[#3c6ca8] hover:bg-[#2c5f8c] active:scale-[.98] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {out ? "Unavailable" : "Add to cart"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  );
};
