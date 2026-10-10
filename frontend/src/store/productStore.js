import { create } from "zustand";
import { request } from "@/lib/api";
import { decodeToken, getStoredToken } from "@/lib/token";
import { withArt } from "@/lib/art";

const fail = (res) => ({ success: false, message: res.message });
// The backend answers with `products` / `product`; older code used `data`.
const listOf = (d) => (d.products || d.data || []).map(withArt);
const oneOf = (d) => withArt(d.product || d.data);

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),

  createProduct: async (newProduct) => {
    if (!newProduct?.name || !newProduct?.price || !newProduct?.category) {
      return { success: false, message: "Please fill all fields" };
    }
    if (newProduct.image && newProduct.image.length > 7000000) {
      return { success: false, message: "Image is too large. Please use an image smaller than 5MB" };
    }
    const res = await request("/api/products/create", { method: "POST", auth: true, body: newProduct });
    if (!res.ok) return fail(res);
    set((state) => ({ products: [oneOf(res.data), ...state.products] }));
    return { success: true, message: "Product created" };
  },

  getProducts: async () => {
    const res = await request("/api/products");
    if (!res.ok) return fail(res);
    const products = listOf(res.data);
    set({ products });
    return { success: true, data: products };
  },

  deleteProduct: async (id) => {
    const res = await request(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
    if (!res.ok) return fail(res);
    set((state) => ({ products: state.products.filter((p) => p._id !== id) }));
    return { success: true, message: "Product deleted" };
  },

  updateProduct: async (id, updatedProduct) => {
    const res = await request(`/api/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      auth: true,
      body: updatedProduct,
    });
    if (!res.ok) return fail(res);
    const updated = oneOf(res.data);
    set((state) => ({ products: state.products.map((p) => (p._id === id ? updated : p)) }));
    return { success: true, message: "Product updated" };
  },

  getProductById: async (id) => {
    const res = await request(`/api/products/${encodeURIComponent(id)}`);
    return res.ok ? { success: true, product: oneOf(res.data) } : fail(res);
  },

  getProductImage: async (id) => {
    const res = await request(`/api/products/image/${encodeURIComponent(id)}`);
    return res.ok ? { success: true, image: res.data.image, imageType: res.data.imageType } : fail(res);
  },

  getProductsByCategory: async (category) => {
    const res = await request(`/api/products/category/${encodeURIComponent(category)}`);
    if (!res.ok) return fail(res);
    const products = listOf(res.data);
    set({ products });
    return { success: true, data: products };
  },

  getProductsBySeller: async () => {
    const decoded = decodeToken(getStoredToken());
    if (!decoded?.email) return { success: false, message: "No authentication token found" };
    const res = await request(`/api/products/seller/${encodeURIComponent(decoded.email)}`);
    if (!res.ok) return fail(res);
    const products = listOf(res.data);
    set({ products });
    return { success: true, message: "Seller products retrieved successfully", data: products };
  },

  getProductsByRating: async (rating) => {
    const res = await request(`/api/products/rating/${encodeURIComponent(rating)}`);
    if (!res.ok) return fail(res);
    const products = listOf(res.data);
    set({ products });
    return { success: true, data: products };
  },
}));
