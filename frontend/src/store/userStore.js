import { create } from "zustand";
import { request } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/token";

const fail = (res) => ({ success: false, message: res.message });

// The API returns a session token with login/register; keep it and tell the header.
function saveToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("aizy-auth"));
}

export const useUserStore = create((set, get) => ({
  user: null,
  users: [],
  bannedUsers: [],
  setUser: (user) => set({ user }),

  createUser: async (user) => {
    if (!user?.password || !user?.email || !user?.name) {
      return { success: false, message: "Please provide all fields" };
    }
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.userType || "customer",
        proof: user.proof,
      },
    });
    if (!res.ok) return fail(res);
    set({ user: res.data.data });
    saveToken(res.data.token);
    return { success: true, message: res.data.message || "User created successfully" };
  },

  loginUser: async (user) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: { email: user.email, password: user.password, role: user.userType },
    });
    if (!res.ok) {
      return { ...fail(res), reason: res.data.reason, bannedUntil: res.data.bannedUntil };
    }
    set({ user: res.data.data });
    saveToken(res.data.token);
    return { success: true, message: res.data.message || "Login successful" };
  },

  logoutUser: () => {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("aizy-auth"));
    set({ user: null, users: [], bannedUsers: [] });
    return { success: true, message: "Logged out successfully" };
  },

  generateOtp: async (email) => {
    const res = await request("/auth/generate-otp", { method: "POST", body: { email } });
    if (!res.ok) return { success: false, message: res.message || "Failed to generate OTP" };
    // demoOtp (demo backend) / devOtp (live backend without an email provider) are only sent when no email goes out.
    return { success: true, message: res.data.message, demoOtp: res.data.demoOtp || res.data.devOtp };
  },

  verifyOtp: async (email, otp) => {
    const res = await request("/auth/verify-otp", { method: "POST", body: { email, otp } });
    return res.ok ? { success: true, proof: res.data.proof } : fail(res);
  },

  getAllUsers: async () => {
    const res = await request("/auth/users", { auth: true });
    if (!res.ok) return fail(res);
    set({ users: res.data.data });
    return { success: true, data: res.data.data };
  },

  getBannedUsers: async () => {
    const res = await request("/auth/banned-users", { auth: true });
    if (!res.ok) return fail(res);
    set({ bannedUsers: res.data.data });
    return { success: true, data: res.data.data };
  },

  banUser: async (userId, reason, banDuration) => {
    const res = await request("/auth/ban-user", { method: "POST", auth: true, body: { userId, reason, banDuration } });
    if (!res.ok) return fail(res);
    await get().getBannedUsers();
    return { success: true, message: res.data.message || "User banned successfully" };
  },

  unbanUser: async (userId) => {
    const res = await request("/auth/unban-user", { method: "POST", auth: true, body: { userId } });
    if (!res.ok) return fail(res);
    await get().getBannedUsers();
    return { success: true, message: res.data.message || "User unbanned successfully" };
  },

  createAdmin: async (adminData) => {
    if (!adminData?.name || !adminData?.email || !adminData?.password || !adminData?.adminId) {
      return { success: false, message: "All fields are required" };
    }
    const res = await request("/auth/create-admin", {
      method: "POST",
      auth: true,
      body: {
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        adminId: adminData.adminId,
      },
    });
    if (!res.ok) return fail(res);
    await get().getAllUsers();
    return { success: true, message: res.data.message || "Admin created successfully" };
  },

  getUserProfile: async () => {
    const res = await request("/auth/profile", { auth: true });
    return res.ok ? { success: true, data: res.data.data } : fail(res);
  },

  updateProfile: async (profileData) => {
    const res = await request("/auth/update-profile", { method: "POST", auth: true, body: profileData });
    return res.ok ? { success: true, data: res.data.data, message: res.data.message } : fail(res);
  },
}));
