/**
 * @jest-environment node
 */
import { answer, recommend } from "@/lib/demo/fashion";
import rows from "@/lib/demo/fashionData.json";

const names = (prompt) => recommend(prompt).picks.map((p) => p.d.name);

describe("fashion assistant", () => {
  test("ships the full training set", () => {
    expect(rows.length).toBeGreaterThan(800);
  });

  test("respects gender words", () => {
    const girl = recommend("outfit for a girl at a wedding");
    const boy = recommend("outfit for a boy at a wedding");
    expect(girl.gender).toBe("g");
    expect(boy.gender).toBe("b");
    expect(girl.picks.every((p) => p.d.gender === "g")).toBe(true);
    expect(boy.picks.every((p) => p.d.gender === "b")).toBe(true);
  });

  test("matches occasions and synonyms", () => {
    expect(names("boy for ramzan").join(" ")).toMatch(/pathani|kurta|sherwani|suit/i);
    const eid = recommend("boy outfit for eid").picks.map((p) => p.d.occasion);
    expect(eid).toContain("ramzan");
    const meeting = recommend("I am a girl and need to attend a client meeting at a corporate office").picks;
    expect(meeting.some((p) => /formal/i.test(p.d.category) || /formal/.test(p.d.occasion))).toBe(true);
  });

  test("matches regions", () => {
    const hyd = recommend("girl, wedding in hyderabad").picks;
    expect(hyd.length).toBeGreaterThan(0);
  });

  test("returns store products that match the picks, best rated first", () => {
    const catalogue = [
      { _id: "1", name: "Banarasi Lehenga", category: "Ethnic Wear", rating: 4.9 },
      { _id: "2", name: "Graphic Tee", category: "Western Wear", rating: 4.1 },
      { _id: "3", name: "Cotton Kurta Set", category: "Ethnic Wear", rating: 4.5 },
    ];
    const res = answer("girl at a wedding", catalogue);
    expect(res.products.map((p) => p._id)).toEqual(expect.arrayContaining(["1"]));
    expect(res.products.map((p) => p._id)).not.toContain("2");
    expect(res.products[0].rating).toBeGreaterThanOrEqual(res.products[res.products.length - 1].rating);
  });

  test("does not suggest men's wear to a girl or the reverse", () => {
    const catalogue = [
      { _id: "1", name: "Silk Blend Sherwani", category: "Ethnic Wear", rating: 5 },
      { _id: "2", name: "Banarasi Lehenga", category: "Ethnic Wear", rating: 4 },
    ];
    expect(answer("girl at a wedding", catalogue).products.map((p) => p._id)).toEqual(["2"]);
    expect(answer("boy at a wedding", catalogue).products.map((p) => p._id)).toEqual(["1"]);
  });

  test("handles empty and unmatched input gracefully", () => {
    expect(answer("   ").picks).toEqual([]);
    const none = answer("zzzz qqqq xxxx");
    expect(none.picks).toEqual([]);
    expect(none.message).toMatch(/couldn't match/i);
  });

  test("does not execute or echo markup", () => {
    const res = answer("<script>alert(1)</script> girl party");
    expect(res.message).not.toContain("<script>");
  });
});
