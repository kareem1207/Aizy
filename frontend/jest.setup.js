import "@testing-library/jest-dom";

// Next.js router: stable mocks so tests can assert navigation.
export const mockRouter = { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() };
jest.mock("next/navigation", () => ({
  useRouter: () => require("./jest.setup").mockRouter,
  usePathname: () => "",
}));

beforeEach(() => {
  if (typeof window !== "undefined") window.localStorage.clear();
});
