/**
 * @jest-environment node
 */
import { buildForecast, syntheticHistory } from "@/lib/demo/forecast";

const products = [
  { _id: "a1", name: "Alpha", price: 500, rating: 4.8, count: 20 },
  { _id: "b2", name: "Beta", price: 2500, rating: 3.9, count: 4 },
  { _id: "c3", name: "Gamma", price: 100, rating: 4.2, count: 90 },
];
const NOW = new Date("2026-06-15T00:00:00Z");

describe("sales forecaster", () => {
  test("history is deterministic per product", () => {
    expect(syntheticHistory(products[0], NOW)).toEqual(syntheticHistory(products[0], NOW));
    expect(syntheticHistory(products[0], NOW)).not.toEqual(syntheticHistory(products[1], NOW));
    expect(syntheticHistory(products[0], NOW)).toHaveLength(24);
  });

  test("returns the dashboard contract", () => {
    const f = buildForecast(products, [], 6, NOW);
    expect(f.months_forecasted).toBe(6);
    expect(Object.keys(f.sales_forecasts).sort()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(Object.keys(f.profit_forecasts).sort()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(f.series.labels).toHaveLength(24);
    expect(f.series.futureLabels).toHaveLength(6);
    expect(f.series.futureLabels[0]).toBe("2026-06");
    expect(f.series.history.every(Number.isFinite)).toBe(true);
    expect(f.series.forecast.every((v) => v >= 0)).toBe(true);
  });

  test("best product is the top revenue forecast and profit never exceeds sales", () => {
    const f = buildForecast(products, [], 3, NOW);
    const top = Object.entries(f.sales_forecasts).sort((a, b) => b[1] - a[1])[0][0];
    expect(f.best_overall_product).toBe(top);
    Object.keys(f.sales_forecasts).forEach((n) => expect(f.profit_forecasts[n]).toBeLessThanOrEqual(f.sales_forecasts[n]));
  });

  test("clamps the horizon to 1..12 months", () => {
    expect(buildForecast(products, [], 99, NOW).months_forecasted).toBe(12);
    expect(buildForecast(products, [], 0, NOW).months_forecasted).toBe(3);
    expect(buildForecast(products, [], -4, NOW).months_forecasted).toBe(1);
  });

  test("real orders feed the model", () => {
    const base = buildForecast(products, [], 3, NOW);
    const orders = [{ date: "2026-05-20T00:00:00Z", items: [{ productId: "b2", qty: 400, price: 2500 }] }];
    const boosted = buildForecast(products, orders, 3, NOW);
    expect(boosted.sales_forecasts.Beta).toBeGreaterThan(base.sales_forecasts.Beta);
  });

  test("flags low stock and handles an empty list", () => {
    expect(buildForecast(products, [], 3, NOW).insights.lowStock).toEqual(["Beta"]);
    const empty = buildForecast([], [], 3, NOW);
    expect(empty.best_overall_product).toBeNull();
    expect(empty.sales_forecasts).toEqual({});
  });
});
