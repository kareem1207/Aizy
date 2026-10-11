/**
 * @jest-environment node
 */
import { kindFor, productArt, isArt } from "@/lib/art";
import { buildSeedProducts } from "@/lib/demo/seed";

const decode = (uri) => decodeURIComponent(uri.split(",").slice(1).join(","));

describe("product artwork", () => {
  test("every seeded product gets a specific drawing, not the generic fallback", () => {
    const products = buildSeedProducts();
    const generic = products.filter((p) => kindFor(p.name, p.category) === "bag2" && !/bag/i.test(p.name));
    expect(generic.map((p) => p.name)).toEqual([]);
  });

  test("maps names to sensible kinds", () => {
    expect(kindFor("Silk Blend Sherwani")).toBe("sherwani");
    expect(kindFor("Running Shoes")).toBe("sneaker");
    expect(kindFor("Wireless Earbuds")).toBe("earbuds");
    expect(kindFor("Vivobook Laptop 15")).toBe("laptop");
    expect(kindFor("Graphic Cotton Tee")).toBe("tee");
    expect(kindFor("Nehru Jacket")).toBe("vest");
    expect(kindFor("Classic Denim Jacket")).toBe("jacket");
    expect(kindFor("Mystery Thing", "Footwear")).toBe("sneaker");
  });

  test("tiles are valid SVG data URIs with no emoji or text", () => {
    const uri = productArt("Ethnic Wear", "Banarasi Lehenga");
    expect(isArt(uri)).toBe(true);
    const svg = decode(uri);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("<text");
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(svg)).toBe(false);
  });

  test("different product types draw differently", () => {
    const names = ["Cotton Kurta Set", "Running Shoes", "Wall Clock", "Yoga Mat", "Wireless Earbuds"];
    const tiles = new Set(names.map((n) => productArt("Sports", n)));
    expect(tiles.size).toBe(names.length);
  });

  test("seed products carry no emoji field", () => {
    expect(buildSeedProducts().every((p) => p.emoji === undefined)).toBe(true);
  });
});
