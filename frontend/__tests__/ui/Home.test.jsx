import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import Home from "@/ui/Home";
import { useProductStore } from "@/store/productStore";
import { sampleProduct } from "../utils/test-utils";

jest.mock("@/components/Chat", () => ({ Chat: ({ close }) => <div role="dialog" aria-label="AI stylist"><button onClick={() => close(false)}>x</button></div> }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const catalogue = [
  sampleProduct({ _id: "1", name: "Cotton Kurta Set", category: "Ethnic Wear", price: 1799, rating: 4.5, createdAt: "2026-01-01", shortDescription: "Festive set", description: "Soft cotton" }),
  sampleProduct({ _id: "2", name: "Running Shoes", category: "Footwear", price: 3299, rating: 4.6, createdAt: "2026-03-01", shortDescription: "Cushioned", description: "For daily runs" }),
  sampleProduct({ _id: "3", name: "Gel Pen Pack", category: "Stationery", price: 120, rating: 4.4, count: 0, createdAt: "2026-02-01", shortDescription: "Ten colours", description: "Smooth ink" }),
];

const load = (impl) => {
  const getProducts = jest.fn(impl || (async () => {
    useProductStore.setState({ products: catalogue });
    return { success: true, data: catalogue };
  }));
  useProductStore.setState({ products: [], getProducts });
  return getProducts;
};

const names = () => within(screen.getByTestId("product-grid")).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("Home", () => {
  test("shows a spinner, then the products", async () => {
    load();
    render(<Home />);
    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
    await screen.findByTestId("product-grid");
    expect(names()).toHaveLength(3);
    expect(screen.getByTestId("result-count")).toHaveTextContent("3 products");
  });

  test("shows an error with a working retry when the API is down", async () => {
    let calls = 0;
    load(async () => {
      calls += 1;
      if (calls === 1) return { success: false, message: "Cannot connect to the server" };
      useProductStore.setState({ products: catalogue });
      return { success: true, data: catalogue };
    });
    render(<Home />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot connect to the server");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByTestId("product-grid");
  });

  test("category tabs filter the grid", async () => {
    load();
    render(<Home />);
    await screen.findByTestId("product-grid");
    fireEvent.click(screen.getByRole("tab", { name: "Footwear" }));
    expect(names()).toEqual(["Running Shoes"]);
    fireEvent.click(screen.getByRole("tab", { name: "All" }));
    expect(names()).toHaveLength(3);
  });

  test("search narrows results and explains an empty result", async () => {
    load();
    render(<Home />);
    await screen.findByTestId("product-grid");
    fireEvent.change(screen.getByPlaceholderText(/search for products/i), { target: { value: "kurta" } });
    expect(names()).toEqual(["Cotton Kurta Set"]);
    expect(screen.getByTestId("result-count")).toHaveTextContent("1 product");
    fireEvent.change(screen.getByPlaceholderText(/search for products/i), { target: { value: "zzzz" } });
    expect(screen.getByText(/No products found for/)).toBeInTheDocument();
  });

  test("sorting and the in-stock filter", async () => {
    load();
    render(<Home />);
    await screen.findByTestId("product-grid");
    fireEvent.change(screen.getByLabelText(/sort/i), { target: { value: "price-asc" } });
    expect(names()).toEqual(["Gel Pen Pack", "Cotton Kurta Set", "Running Shoes"]);
    fireEvent.change(screen.getByLabelText(/sort/i), { target: { value: "rating" } });
    expect(names()[0]).toBe("Running Shoes");
    fireEvent.click(screen.getByLabelText(/in stock only/i));
    expect(names()).not.toContain("Gel Pen Pack");
  });

  test("the AI stylist button opens and closes the chat", async () => {
    load();
    render(<Home />);
    await screen.findByTestId("product-grid");
    fireEvent.click(screen.getByRole("button", { name: "Open AI stylist" }));
    expect(screen.getByRole("dialog", { name: "AI stylist" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "x" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
