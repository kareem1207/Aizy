import { create } from "zustand";

const API_BASE_URL = "http://localhost:8000";

export const useAIStore = create((set) => ({
  fashionLoading: false,
  salesLoading: false,
  error: null,
  getFashionRecommendation: async (prompt) => {
    set({ fashionLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/ai/fashion/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set({ fashionLoading: false });

      if (data.success) {
        return data.data.recommendation;
      } else {
        throw new Error(data.message || "Failed to get fashion recommendation");
      }
    } catch (error) {
      set({ fashionLoading: false, error: error.message });
      console.error("Fashion recommendation error:", error);
      throw error;
    }
  },
  getSalesForecast: async () => {
    this.salesLoading = true;
    this.error = null;

    try {
      const response = await fetch(`${API_BASE_URL}/ai/sales/forecast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.salesLoading = false;

      if (data.success) {
        return data.data.forecast;
      } else {
        throw new Error(data.message || "Failed to get sales forecast");
      }
    } catch (error) {
      this.salesLoading = false;
      this.error = error.message;
      console.error("Sales forecast error:", error);
      throw error;
    }
  },
}));
