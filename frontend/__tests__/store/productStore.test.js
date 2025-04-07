import { useProductStore } from "@/store/productStore";
import fetchMock from "jest-fetch-mock";

// Enable fetch mocks
fetchMock.enableMocks();

describe("productStore", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
    localStorage.setItem("user_login_token", "fake-token");
  });

  describe("getProducts", () => {
    it("fetches products successfully", async () => {
      const mockProducts = [
        { _id: "1", name: "Product 1", price: 99.99 },
        { _id: "2", name: "Product 2", price: 49.99 },
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          success: true,
          data: mockProducts,
        })
      );

      const { getProducts } = useProductStore.getState();
      const result = await getProducts();

      expect(fetchMock).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockProducts });
    });

    it("handles error when fetching products", async () => {
      fetchMock.mockRejectOnce(new Error("Network error"));

      const { getProducts } = useProductStore.getState();
      const result = await getProducts();

      expect(fetchMock).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: "Cannot connect to server",
      });
    });
  });

  describe("getProductsBySeller", () => {
    it("fetches seller products successfully", async () => {
      const mockProducts = [
        { _id: "1", name: "Seller Product 1", price: 99.99 },
        { _id: "2", name: "Seller Product 2", price: 49.99 },
      ];

      fetchMock.mockResponseOnce(
        JSON.stringify({
          success: true,
          data: mockProducts,
        })
      );

      const { getProductsBySeller } = useProductStore.getState();
      const result = await getProductsBySeller();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/products/seller-products"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
        })
      );

      expect(result).toEqual({ success: true, data: mockProducts });
    });
  });

  describe("createProduct", () => {
    it("creates a product successfully", async () => {
      const newProduct = {
        name: "New Product",
        price: 129.99,
        category: "Electronics",
        description: "Product description",
        sellersName: "Test Seller",
        count: 10,
      };

      fetchMock.mockResponseOnce(
        JSON.stringify({
          success: true,
          message: "Product created successfully",
          data: { _id: "new-id", ...newProduct },
        })
      );

      const { createProduct } = useProductStore.getState();
      const result = await createProduct(newProduct);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/products/create"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
          body: JSON.stringify(newProduct),
        })
      );

      expect(result).toEqual({
        success: true,
        message: "Product created successfully",
      });
    });
  });
});
