import { useProductStore } from "@/store/productStore";
import { request } from "@/lib/api";
import { isArt } from "@/lib/art";
import { signIn, sampleProduct } from "../utils/test-utils";

jest.mock("@/lib/api", () => ({ request: jest.fn() }));

const ok = (data) => ({ ok: true, status: 200, data, message: "" });
const bad = (message) => ({ ok: false, status: 400, data: {}, message });

beforeEach(() => {
  request.mockReset();
  useProductStore.setState({ products: [] });
});

describe("productStore", () => {
  test("getProducts reads `products` and fills in artwork for products without an image", async () => {
    request.mockResolvedValue(ok({ success: true, products: [sampleProduct({ image: "" }), sampleProduct({ _id: "p2", image: "data:image/png;base64,AA" })] }));
    const res = await useProductStore.getState().getProducts();
    expect(res.success).toBe(true);
    const [a, b] = useProductStore.getState().products;
    expect(isArt(a.image)).toBe(true);
    expect(b.image).toBe("data:image/png;base64,AA");
  });

  test("getProducts reports failures instead of throwing", async () => {
    request.mockResolvedValue(bad("Cannot connect"));
    expect(await useProductStore.getState().getProducts()).toEqual({ success: false, message: "Cannot connect" });
  });

  test("createProduct validates, then prepends the saved product", async () => {
    expect((await useProductStore.getState().createProduct({ name: "x" })).success).toBe(false);
    request.mockResolvedValue(ok({ success: true, product: sampleProduct({ _id: "new" }) }));
    const res = await useProductStore.getState().createProduct({ name: "Kurta", price: 10, category: "Ethnic Wear" });
    expect(res.success).toBe(true);
    expect(useProductStore.getState().products[0]._id).toBe("new");
    expect(request).toHaveBeenCalledWith("/api/products/create", expect.objectContaining({ method: "POST", auth: true }));
  });

  test("createProduct refuses oversized images before calling the API", async () => {
    const res = await useProductStore.getState().createProduct({ name: "a", price: 1, category: "c", image: "x".repeat(7000001) });
    expect(res.success).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  test("deleteProduct removes it from state only on success", async () => {
    useProductStore.setState({ products: [sampleProduct(), sampleProduct({ _id: "p2" })] });
    request.mockResolvedValueOnce(bad("You can only modify your own products"));
    expect((await useProductStore.getState().deleteProduct("p1")).success).toBe(false);
    expect(useProductStore.getState().products).toHaveLength(2);
    request.mockResolvedValueOnce(ok({ success: true }));
    await useProductStore.getState().deleteProduct("p1");
    expect(useProductStore.getState().products.map((p) => p._id)).toEqual(["p2"]);
  });

  test("updateProduct swaps the updated product in", async () => {
    useProductStore.setState({ products: [sampleProduct()] });
    request.mockResolvedValue(ok({ success: true, product: sampleProduct({ price: 5 }) }));
    await useProductStore.getState().updateProduct("p1", { price: 5 });
    expect(useProductStore.getState().products[0].price).toBe(5);
  });

  test("getProductsBySeller uses the email inside the stored token", async () => {
    signIn("seller", { email: "me@shop.in" });
    request.mockResolvedValue(ok({ success: true, products: [sampleProduct()] }));
    const res = await useProductStore.getState().getProductsBySeller();
    expect(res.success).toBe(true);
    expect(request).toHaveBeenCalledWith("/api/products/seller/me%40shop.in");
  });

  test("getProductsBySeller without a session fails cleanly", async () => {
    expect((await useProductStore.getState().getProductsBySeller()).success).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
});
