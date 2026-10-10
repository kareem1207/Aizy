import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Card } from "@/components/Card";
import { useCartStore } from "@/store/cartStore";
import { sampleProduct } from "../utils/test-utils";

jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
import { toast } from "react-toastify";

beforeEach(() => {
  useCartStore.setState({ items: [], open: false });
  jest.clearAllMocks();
});

describe("Card grid", () => {
  test("renders every product with name, price and category", () => {
    render(<Card card={[sampleProduct(), sampleProduct({ _id: "p2", name: "Running Shoes", price: 3299, category: "Footwear" })]} />);
    expect(screen.getByText("Cotton Kurta Set")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    expect(screen.getByText("₹1,799")).toBeInTheDocument();
    expect(screen.getByText("₹3,299")).toBeInTheDocument();
  });

  test("renders nothing for a missing list", () => {
    const { container } = render(<Card card={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("add to cart puts the product in the cart and confirms with a toast", () => {
    render(<Card card={[sampleProduct()]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(useCartStore.getState().items).toEqual([expect.objectContaining({ _id: "p1", qty: 1 })]);
    expect(toast.success).toHaveBeenCalled();
  });

  test("adding twice increments, and stops at the available stock", () => {
    render(<Card card={[sampleProduct({ count: 2 })]} />);
    const add = screen.getByRole("button", { name: "Add to cart" });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);
    expect(useCartStore.getState().items[0].qty).toBe(2);
    expect(toast.error).toHaveBeenCalledWith("Only 2 available");
  });

  test("out-of-stock products cannot be added", () => {
    render(<Card card={[sampleProduct({ count: 0 })]} />);
    const btn = screen.getByRole("button", { name: "Unavailable" });
    expect(btn).toBeDisabled();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  test("low stock is flagged", () => {
    render(<Card card={[sampleProduct({ count: 3 })]} />);
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  test("clicking a product opens its details, which can be closed with Escape", () => {
    render(<Card card={[sampleProduct()]} />);
    fireEvent.click(screen.getByRole("button", { name: "View Cotton Kurta Set" }));
    const dialog = screen.getByRole("dialog", { name: "Cotton Kurta Set" });
    expect(dialog).toHaveTextContent("A longer description");
    expect(dialog).toHaveTextContent("Sold by Aizy Official");
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("the details dialog adds the chosen quantity", () => {
    render(<Card card={[sampleProduct()]} />);
    fireEvent.click(screen.getByRole("button", { name: "View Cotton Kurta Set" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByTestId("modal-qty")).toHaveTextContent("3");
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector("button.flex-1"));
    expect(useCartStore.getState().items[0].qty).toBe(3);
  });
});
