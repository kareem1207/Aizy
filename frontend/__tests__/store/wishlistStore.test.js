import { useWishlistStore } from "@/store/wishlistStore";

beforeEach(() => useWishlistStore.setState({ ids: [] }));

describe("wishlistStore", () => {
  test("toggle saves and unsaves, and persists", () => {
    expect(useWishlistStore.getState().toggle("a")).toBe(true);
    expect(useWishlistStore.getState().toggle("b")).toBe(true);
    expect(useWishlistStore.getState().toggle("a")).toBe(false);
    expect(useWishlistStore.getState().ids).toEqual(["b"]);
    expect(JSON.parse(localStorage.getItem("aizy_wishlist_v1"))).toEqual(["b"]);
  });

  test("hydrate restores saved ids and ignores corrupt data", () => {
    localStorage.setItem("aizy_wishlist_v1", JSON.stringify(["x", 5, "y"]));
    useWishlistStore.getState().hydrate();
    expect(useWishlistStore.getState().ids).toEqual(["x", "y"]);
    localStorage.setItem("aizy_wishlist_v1", "{not json");
    useWishlistStore.getState().hydrate();
    expect(useWishlistStore.getState().ids).toEqual([]);
  });
});
