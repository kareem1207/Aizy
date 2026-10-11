import { create } from "zustand";

const KEY = "aizy_wishlist_v1";

function read() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function write(ids) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: the list lives in memory only */
  }
}

export const useWishlistStore = create((set, get) => ({
  ids: [],
  hydrate: () => set({ ids: read() }),
  has: (id) => get().ids.includes(id),
  toggle: (id) => {
    const ids = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id];
    write(ids);
    set({ ids });
    return ids.includes(id);
  },
}));
