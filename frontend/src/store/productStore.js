import { create } from "zustand";
import jwt from "jsonwebtoken";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      return { success: false, message: "Please fill all fields" };
    }

    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "No authentication token found" };
      }

      const res = await fetch("http://localhost:5000/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({ products: [...state.products, data.data] }));
      return { success: true, message: "Product created" };
    } catch (error) {
      console.error("Error creating product:", error);
      return { success: false, message: "Failed to create product" };
    }
  },

  getProducts: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();

      if (!data.success) return { success: false, message: data.message };

      // Adjust based on your API response structure
      const productsArray = data.products || data.data || [];
      set({ products: productsArray });

      return { success: true, data: productsArray };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, message: "Failed to fetch products" };
    }
  },

  deleteProduct: async (id) => {
    try {
      const token = localStorage.getItem("user_login_token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        products: state.products.filter((product) => product._id !== id),
      }));

      return { success: true, message: "Product deleted" };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, message: "Failed to delete product" };
    }
  },

  updateProduct: async (id, updatedProduct) => {
    try {
      const token = localStorage.getItem("user_login_token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        products: state.products.map((product) =>
          product._id === id ? data.data : product
        ),
      }));

      return { success: true, message: "Product updated" };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, message: "Failed to update product" };
    }
  },

  getProductById: async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await res.json();

      if (!data.success) return { success: false, message: data.message };
      return { success: true, product: data.product || data.data };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, message: "Failed to fetch product" };
    }
  },

  getProductsByCategory: async (category) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products/category/${category}`
      );

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      const productsArray = data.data || [];
      set({ products: productsArray });

      return { success: true, data: productsArray };
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return {
        success: false,
        message: "Failed to fetch products by category",
      };
    }
  },

  getProductsBySeller: async () => {
    try {
      const token = localStorage.getItem("user_login_token");
      if (!token) {
        return { success: false, message: "No authentication token found" };
      }
      const decoded = jwt.decode(token);

      // Change the endpoint to match your backend route
      // Using just "/seller" as the endpoint path
      const res = await fetch(
        `http://localhost:5000/api/products/seller/${decoded.email}`
      );

      const data = await res.json();
      console.log("Seller API response:", data);

      if (!data.success) {
        return {
          success: false,
          message: data.message || "Failed to fetch seller products",
        };
      }

      // Handle different possible data structures
      const productsArray = data.data || data.products || [];
      console.log("Setting products:", productsArray);
      set({ products: productsArray });

      return {
        success: true,
        message: "Seller products retrieved successfully",
        data: productsArray,
      };
    } catch (error) {
      console.error("Error fetching seller products:", error);
      return {
        success: false,
        message: "Failed to fetch seller products: " + error.message,
      };
    }
  },

  getProductsByRating: async (rating) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products/rating/${rating}`
      );

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      const productsArray = data.data || [];
      set({ products: productsArray });

      return { success: true, data: productsArray };
    } catch (error) {
      console.error("Error fetching products by rating:", error);
      return { success: false, message: "Failed to fetch products by rating" };
    }
  },
}));
