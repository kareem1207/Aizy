import { create } from "zustand";
import { request } from "@/lib/api";

export const useOrderStore = create(() => ({
  getMyOrders: async () => {
    const res = await request("/api/orders/mine", { auth: true });
    return res.ok ? { success: true, data: res.data.orders || [] } : { success: false, message: res.message };
  },
  getSellerOrders: async () => {
    const res = await request("/api/orders/seller", { auth: true });
    return res.ok ? { success: true, data: res.data.orders || [] } : { success: false, message: res.message };
  },
}));
