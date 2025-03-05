import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  createUser: async (user) => {
    if (!user.password || !user.email || !user.name) {
      return { success: false, message: "Please provide all fields" };
    }

    console.log("Starting user creation attempt...");
    try {
      // Map userType to role
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

      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      console.log("Fetch response status:", res.status);

      // Parse JSON only if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);

        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message:
              errorData.message || `Error: ${res.status} ${res.statusText}`,
          };
        } catch (e) {
          // If not JSON, return the text or status
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
          "Cannot connect to server. Please ensure your backend is running at http://localhost:5000",
      };
    }
  },

  loginUser: async (user) => {
    try {
      const loginData = {
        email: user.email,
        password: user.password,
      };

      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      // Handle non-200 responses
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
          "Cannot connect to server. Please check if the backend is running at http://localhost:5000",
      };
    }
  },

  logoutUser: () => {
    set({ user: null });
    return { success: true, message: "Logged out successfully" };
  },
}));
