import { use } from "react";
import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  createUser: async (user) => {
    if (!userData.password || !userData.email || !userData.name) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }
    const res = fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      set({ user: data.data });
    }
    return { success: true, message: "User created" };
  },
  loginUser: async (user) => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      set({ user: data.data });
    }
    return { success: true, message: "User logged in" };
  },
}));
