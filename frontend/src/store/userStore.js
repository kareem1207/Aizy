import { create } from "zustand";

const api = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000";
export const useUserStore = create((set) => ({
  user: null,
  users: [],
  bannedUsers: [],
  setUser: (user) => set({ user }),

  createUser: async (user) => {
    if (!user.password || !user.email || !user.name) {
      return { success: false, message: "Please provide all fields" };
    }

    console.log("Starting user creation attempt...");
    try {
      const userData = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.userType || "customer",
      };

      console.log("Preparing to send user data:", {
        ...userData,
        password: "****",
      });

      const res = await fetch(`${api}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      console.log("Fetch response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        set({ user: data.data });
        return {
          success: true,
          message: data.message || "User created successfully",
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to create user",
        };
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message:
          "Cannot connect to server. Please ensure your backend is running at ${api}",
      };
    }
  },

  loginUser: async (user) => {
    try {
      const loginData = {
        email: user.email,
        password: user.password,
        role: user.userType,
      };

      const res = await fetch(`${api}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();

      if (data.success) {
        set({ user: data.data });
        return { success: true, message: data.message || "Login successful" };
      } else {
        return {
          success: false,
          message: data.message || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return {
        success: false,
        message:
          "Cannot connect to server. Please check if the backend is running at ${api}",
      };
    }
  },

  generateToken: async (user) => {
    const response = await fetch(`${api}/auth/generate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      set(data.token);
      localStorage.setItem("user_login_token", data.token);
    } else {
      console.error("Failed to generate token");
    }
  },

  logoutUser: () => {
    localStorage.removeItem("user_login_token");
    set({ user: null });
    return { success: true, message: "Logged out successfully" };
  },

  generateOtp: async () => {
    const res = await fetch(`${api}/auth/generate-otp`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error generating OTP:", errorText);
      return { success: false, message: "Failed to generate OTP" };
    }

    const data = await res.json();
    return { success: true, message: "OTP generated successfully", data };
  },

  getAllUsers: async () => {
    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const res = await fetch(`${api}/auth/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();
      if (data.success) {
        set({ users: data.data });
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch users",
        };
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: "Cannot connect to server",
      };
    }
  },

  getBannedUsers: async () => {
    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const res = await fetch(`${api}/auth/banned-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();
      if (data.success) {
        set({ bannedUsers: data.data });
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch banned users",
        };
      }
    } catch (error) {
      console.error("Error fetching banned users:", error);
      return {
        success: false,
        message: "Cannot connect to server",
      };
    }
  },

  banUser: async (userId, reason, banDuration) => {
    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const res = await fetch(`${api}/auth/ban-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          reason,
          banDuration,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();
      if (data.success) {
        const { getBannedUsers } = useUserStore.getState();
        await getBannedUsers();
        return {
          success: true,
          message: data.message || "User banned successfully",
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to ban user",
        };
      }
    } catch (error) {
      console.error("Error banning user:", error);
      return {
        success: false,
        message: "Cannot connect to server",
      };
    }
  },

  unbanUser: async (userId) => {
    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const res = await fetch(`${api}/auth/unban-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          return {
            success: false,
            message: errorText || `Error: ${res.status} ${res.statusText}`,
          };
        }
      }

      const data = await res.json();
      if (data.success) {
        const { getBannedUsers } = useUserStore.getState();
        await getBannedUsers();
        return {
          success: true,
          message: data.message || "User unbanned successfully",
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to unban user",
        };
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      return {
        success: false,
        message: "Cannot connect to server",
      };
    }
  },
}));
