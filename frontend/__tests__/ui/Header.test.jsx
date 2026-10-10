import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Header } from "@/ui/Header";
import { useCartStore } from "@/store/cartStore";
import { signIn } from "../utils/test-utils";

jest.mock("@/components/DemoBanner", () => ({ DemoBanner: () => null }));

beforeEach(() => {
  useCartStore.setState({ items: [], open: false });
});

describe("Header", () => {
  test("signed out: shows Login and the cart", () => {
    render(<Header />);
    expect(screen.getByTestId("login-link")).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("account-link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open cart/i })).toBeInTheDocument();
  });

  test.each([
    ["customer", "Account"],
    ["seller", "Seller hub"],
    ["admin", "Admin"],
  ])("signed in as %s: shows %s", (role, label) => {
    signIn(role);
    render(<Header />);
    expect(screen.getByTestId("account-link")).toHaveTextContent(label);
    expect(screen.queryByTestId("login-link")).not.toBeInTheDocument();
  });

  test("sellers and admins do not get a shopping cart", () => {
    signIn("seller");
    render(<Header />);
    expect(screen.queryByRole("button", { name: /open cart/i })).not.toBeInTheDocument();
  });

  test("an expired or corrupt token counts as signed out", () => {
    localStorage.setItem("user_login_token", "not.a.token");
    render(<Header />);
    expect(screen.getByTestId("login-link")).toBeInTheDocument();
  });

  test("reacts to login and logout events without a reload", () => {
    render(<Header />);
    expect(screen.getByTestId("login-link")).toBeInTheDocument();
    act(() => {
      signIn("customer");
      window.dispatchEvent(new Event("aizy-auth"));
    });
    expect(screen.getByTestId("account-link")).toBeInTheDocument();
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new Event("aizy-auth"));
    });
    expect(screen.getByTestId("login-link")).toBeInTheDocument();
  });

  test("the cart badge shows the number of items", () => {
    render(<Header />);
    act(() => {
      useCartStore.getState().add({ _id: "a", name: "A", price: 10, count: 9, image: "" }, 2);
      useCartStore.getState().add({ _id: "b", name: "B", price: 10, count: 9, image: "" }, 1);
    });
    expect(screen.getByTestId("cart-count")).toHaveTextContent("3");
  });
});
