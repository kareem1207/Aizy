import { create } from "zustand";
import { request } from "@/lib/api";
import { useProductStore } from "./productStore";

const KEY = "aizy_cart_v1";
const MAX_QTY = 20;

function read() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && i._id && i.qty > 0) : [];
  } catch {
    return [];
  }
}
function write(items) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: cart lives in memory only */
  }
}

export const useCartStore = create((set, get) => ({
  items: [],
  open: false,
  hydrated: false,

  hydrate: () => set({ items: read(), hydrated: true }),
  setOpen: (open) => set({ open }),

  add: (product, qty = 1) => {
    if (!product || product.count <= 0) return { success: false, message: "Product is out of stock" };
    const items = [...get().items];
    const line = items.find((i) => i._id === product._id);
    const next = Math.min(MAX_QTY, product.count, (line?.qty || 0) + qty);
    if (line && next === line.qty) return { success: false, message: `Only ${product.count} available` };
    if (line) line.qty = next;
    else items.push({ _id: product._id, name: product.name, price: product.price, image: product.image, max: product.count, qty: next });
    write(items);
    set({ items });
    return { success: true };
  },

  setQty: (id, qty) => {
    const items = get()
      .items.map((i) => (i._id === id ? { ...i, qty: Math.min(i.max, MAX_QTY, qty) } : i))
      .filter((i) => i.qty > 0);
    write(items);
    set({ items });
  },

  remove: (id) => {
    const items = get().items.filter((i) => i._id !== id);
    write(items);
    set({ items });
  },

  clear: () => {
    write([]);
    set({ items: [] });
  },

  count: () => get().items.reduce((a, i) => a + i.qty, 0),
  total: () => get().items.reduce((a, i) => a + i.qty * i.price, 0),

  /** Places an order (no payment is taken anywhere in this app). */
  checkout: async () => {
    const items = get().items;
    const res = await request("/api/orders", {
      method: "POST",
      auth: true,
      body: { items: items.map((i) => ({ productId: i._id, qty: i.qty })) },
    });
    if (!res.ok) return { success: false, message: res.message, status: res.status };
    get().clear();
    // Stock changed, so refresh the catalogue the storefront is showing.
    useProductStore.getState().getProducts();
    return { success: true, order: res.data.order };
  },
}));
