import React from "react";
import { render, screen } from "@testing-library/react";
import { Main } from "@/ui/Main";
import { signIn } from "../utils/test-utils";

jest.mock("@/ui/Home", () => ({ __esModule: true, default: () => <div>CUSTOMER VIEW</div> }));
jest.mock("@/ui/Seller", () => ({ Seller: () => <div>SELLER VIEW</div> }));
jest.mock("@/ui/Admin", () => ({ Admin: () => <div>ADMIN VIEW</div> }));

describe("Main role routing", () => {
  test("anonymous visitors see the storefront", () => {
    render(<Main />);
    expect(screen.getByText("CUSTOMER VIEW")).toBeInTheDocument();
  });

  test.each([
    ["customer", "CUSTOMER VIEW"],
    ["seller", "SELLER VIEW"],
    ["admin", "ADMIN VIEW"],
  ])("%s sees %s", (role, text) => {
    signIn(role);
    render(<Main />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test("a corrupt token falls back to the storefront instead of crashing", () => {
    localStorage.setItem("user_login_token", "###");
    render(<Main />);
    expect(screen.getByText("CUSTOMER VIEW")).toBeInTheDocument();
  });

  test("an unknown role never reveals the admin or seller views", () => {
    signIn("hacker");
    render(<Main />);
    expect(screen.queryByText("ADMIN VIEW")).not.toBeInTheDocument();
    expect(screen.queryByText("SELLER VIEW")).not.toBeInTheDocument();
  });
});
