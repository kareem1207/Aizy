import React from "react";
import { render } from "@testing-library/react";

/**
 * Custom render function that can be extended with providers if needed
 */
const customRender = (ui, options = {}) => {
  return render(ui, { ...options });
};

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { customRender as render };

/**
 * Helper function to simulate local storage for tests
 */
export const setupLocalStorage = (key, value) => {
  localStorage.setItem(
    key,
    typeof value === "string" ? value : JSON.stringify(value)
  );
};

/**
 * Helper function to create a mock JWT token for testing
 */
export const createMockToken = (userData = {}) => {
  const defaultData = {
    userId: "test-user-id",
    username: "Test User",
    email: "test@example.com",
    role: "customer",
    ...userData,
  };

  return `fake-token-${JSON.stringify(defaultData)}`;
};
