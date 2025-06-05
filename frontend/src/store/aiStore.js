import { create } from "zustand";

const API_BASE_URL = "http://127.0.0.1:8000";

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
    set({ salesLoading: true, error: null });
    console.log("🔄 Starting sales forecast request...");

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      console.log(`📡 Fetching from: ${API_BASE_URL}/ai/sales/forecast`);

      const response = await fetch(`${API_BASE_URL}/ai/sales/forecast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Sales forecast data received:", data);
      set({ salesLoading: false });

      if (data.success) {
        return data.data.forecast;
      } else {
        throw new Error(data.message || "Failed to get sales forecast");
      }
    } catch (error) {
      set({ salesLoading: false, error: error.message });

      if (error.name === "AbortError") {
        console.error("⏱️ Sales forecast request timed out");
        throw new Error(
          "Request timed out. The AI analysis is taking longer than expected."
        );
      } else if (error.message.includes("Failed to fetch")) {
        console.error("🔌 Network error - server might not be running");
        throw new Error(
          "Cannot connect to AI server. Please ensure the server is running on port 8000."
        );
      } else {
        console.error("❌ Sales forecast error:", error);
        throw error;
      }
    }
  },
}));
