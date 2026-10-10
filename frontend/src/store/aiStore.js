import { create } from "zustand";
import { request } from "@/lib/api";
import { IS_DEMO } from "@/lib/config";

export const useAIStore = create((set) => ({
  fashionLoading: false,
  salesLoading: false,
  error: null,

  /** Resolves to { recommendation, products, picks }. Throws Error(message) on failure. */
  getFashionRecommendation: async (prompt) => {
    set({ fashionLoading: true, error: null });
    const res = await request("/ai/fashion/query", { method: "POST", body: { prompt } });
    if (!res.ok) {
      const message = aiMessage(res);
      set({ fashionLoading: false, error: message });
      throw new Error(message);
    }
    set({ fashionLoading: false });
    return res.data.data;
  },

  getSalesForecast: async (months = 3) => {
    set({ salesLoading: true, error: null });
    const res = await request("/ai/sales/forecast", {
      method: "POST",
      auth: true,
      body: { months_to_forecast: months },
      timeoutMs: 90000,
    });
    if (!res.ok) {
      const message = aiMessage(res);
      set({ salesLoading: false, error: message });
      throw new Error(message);
    }
    set({ salesLoading: false });
    return res.data.data.forecast;
  },
}));

function aiMessage(res) {
  if (res.status === 0 && !IS_DEMO) {
    return "Cannot connect to the AI server. Make sure it is running (default http://127.0.0.1:8000).";
  }
  return typeof res.message === "string" ? res.message : "The AI service returned an error.";
}
