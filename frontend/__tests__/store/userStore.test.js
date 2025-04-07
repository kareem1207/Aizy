import { useUserStore } from "@/store/userStore";
import fetchMock from "jest-fetch-mock";

// Enable fetch mocks
fetchMock.enableMocks();

describe("userStore", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();

    // Reset state of the store
    const store = useUserStore.getState();
    useUserStore.setState({
      user: null,
      users: [],
      bannedUsers: [],
    });
  });

  describe("loginUser", () => {
    it("successfully logs in a user", async () => {
      // Mock successful API response
      fetchMock.mockResponseOnce(
        JSON.stringify({
          success: true,
          message: "Login successful",
          data: {
            id: "123",
            name: "Test User",
            email: "test@example.com",
            role: "customer",
          },
        })
      );

      const { loginUser } = useUserStore.getState();
      const result = await loginUser({
        email: "test@example.com",
        password: "password123",
      });

      // Check if fetch was called with correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          credentials: "include",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      // Verify return value
      expect(result).toEqual({
        success: true,
        message: "Login successful",
      });

      // Verify store state was updated
      const state = useUserStore.getState();
      expect(state.user).toEqual({
        id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "customer",
      });
    });

    it("handles login failure", async () => {
      // Mock failed API response
      fetchMock.mockResponseOnce(
        JSON.stringify({
          success: false,
          message: "Invalid credentials",
        })
      );

      const { loginUser } = useUserStore.getState();
      const result = await loginUser({
        email: "wrong@example.com",
        password: "wrongpass",
      });

      // Verify return value indicates failure
      expect(result).toEqual({
        success: false,
        message: "Invalid credentials",
      });

      // Verify store state was not updated
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe("logoutUser", () => {
    it("clears user data and removes token", () => {
      // Setup initial state
      useUserStore.setState({ user: { id: "123", name: "Test User" } });
      localStorage.setItem("user_login_token", "fake-token");

      // Execute logout
      const { logoutUser } = useUserStore.getState();
      const result = logoutUser();

      // Check result
      expect(result).toEqual({
        success: true,
        message: "Logged out successfully",
      });

      // Verify store state was cleared
      const state = useUserStore.getState();
      expect(state.user).toBeNull();

      // Verify token was removed from localStorage
      expect(localStorage.getItem("user_login_token")).toBeNull();
    });
  });
});
