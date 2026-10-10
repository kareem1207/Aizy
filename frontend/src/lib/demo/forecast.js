// In-browser sales forecaster for the demo. Monthly revenue per product is
// modelled with damped Holt (level + trend) smoothing, scaled by a seasonal
// index, mirroring what the live service does with ARIMA on products.csv.

const HISTORY_MONTHS = 24;
// Rough Indian retail seasonality (Jan..Dec): festive peak Oct–Nov, wedding season Nov–Feb.
const SEASON = [1.05, 0.92, 0.9, 0.88, 0.9, 0.86, 0.9, 0.98, 1.0, 1.25, 1.32, 1.18];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

function addMonths(date, n) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));
}

/** Deterministic synthetic order history so every visitor sees the same demo data. */
export function syntheticHistory(product, now = new Date()) {
  const rand = rng(hash(product._id || product.name));
  const start = addMonths(now, -HISTORY_MONTHS);
  const popularity = 0.5 + (product.rating || 4) / 5 + rand();
  const growth = 0.99 + rand() * 0.045; // monthly drift
  // Aim for a believable small-shop turnover: roughly Rs 3k-15k of sales per product per month.
  const base = Math.max(1, (6000 * popularity) / Math.max(1, product.price || 500));
  const margin = 0.18 + rand() * 0.2;
  const out = [];
  for (let i = 0; i < HISTORY_MONTHS; i++) {
    const d = addMonths(start, i);
    const units = Math.max(0, Math.round(base * Math.pow(growth, i) * SEASON[d.getUTCMonth()] * (0.82 + rand() * 0.36)));
    const sales = units * (product.price || 0);
    out.push({ month: monthKey(d), units, sales, profit: Math.round(sales * margin) });
  }
  return out;
}

function holt(series, horizon, month0) {
  // De-seasonalise, fit damped trend, re-seasonalise.
  const adj = series.map((v, i) => v / SEASON[(month0 + i) % 12]);
  const alpha = 0.45;
  const beta = 0.2;
  const phi = 0.92;
  let level = adj[0];
  let trend = adj.length > 1 ? adj[1] - adj[0] : 0;
  for (let i = 1; i < adj.length; i++) {
    const prev = level;
    level = alpha * adj[i] + (1 - alpha) * (prev + phi * trend);
    trend = beta * (level - prev) + (1 - beta) * phi * trend;
  }
  const out = [];
  let damp = 0;
  for (let h = 1; h <= horizon; h++) {
    damp += Math.pow(phi, h);
    const v = (level + damp * trend) * SEASON[(month0 + series.length + h - 1) % 12];
    out.push(Math.max(0, Math.round(v)));
  }
  return out;
}

/**
 * @param products catalogue rows
 * @param orders   real demo orders placed in this browser: {date, items:[{productId, qty, price}]}
 */
export function buildForecast(products, orders = [], months = 3, now = new Date()) {
  const horizon = Math.min(12, Math.max(1, Number(months) || 3));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const month0 = addMonths(monthStart, -HISTORY_MONTHS).getUTCMonth();
  const labels = Array.from({ length: HISTORY_MONTHS }, (_, i) => monthKey(addMonths(monthStart, i - HISTORY_MONTHS)));
  const futureLabels = Array.from({ length: horizon }, (_, i) => monthKey(addMonths(monthStart, i)));

  const sales_forecasts = {};
  const profit_forecasts = {};
  const product_series = {};
  const totalsHist = new Array(HISTORY_MONTHS).fill(0);
  const totalsFut = new Array(horizon).fill(0);

  products.forEach((p) => {
    const hist = syntheticHistory(p, now);
    // Fold real orders into the most recent months.
    orders.forEach((o) => {
      const key = monthKey(new Date(o.date));
      const idx = labels.indexOf(key);
      o.items.forEach((it) => {
        if (it.productId !== p._id) return;
        const amount = it.qty * it.price;
        if (idx >= 0) {
          hist[idx].sales += amount;
          hist[idx].profit += Math.round(amount * 0.25);
          hist[idx].units += it.qty;
        }
      });
    });
    const sales = holt(hist.map((h) => h.sales), horizon, month0);
    const ratio = hist.reduce((a, h) => a + h.profit, 0) / Math.max(1, hist.reduce((a, h) => a + h.sales, 0));
    const profit = sales.map((s) => Math.round(s * ratio));
    sales_forecasts[p.name] = sales.reduce((a, b) => a + b, 0);
    profit_forecasts[p.name] = profit.reduce((a, b) => a + b, 0);
    product_series[p.name] = { history: hist.map((h) => h.sales), forecast: sales };
    hist.forEach((h, i) => (totalsHist[i] += h.sales));
    sales.forEach((s, i) => (totalsFut[i] += s));
  });

  const ranked = Object.entries(sales_forecasts).sort((a, b) => b[1] - a[1]);
  const best_overall_product = ranked.length ? ranked[0][0] : null;
  const last6 = totalsHist.slice(-6).reduce((a, b) => a + b, 0);
  const prev6 = totalsHist.slice(-12, -6).reduce((a, b) => a + b, 0);
  const growthPct = prev6 ? ((last6 - prev6) / prev6) * 100 : 0;

  const topNames = ranked.slice(0, 5).map(([n]) => n);
  return {
    sales_forecasts,
    profit_forecasts,
    months_forecasted: horizon,
    best_overall_product,
    series: {
      labels,
      futureLabels,
      history: totalsHist,
      forecast: totalsFut,
      byProduct: Object.fromEntries(topNames.map((n) => [n, product_series[n]])),
    },
    insights: {
      growthPct: Math.round(growthPct * 10) / 10,
      peakMonth: futureLabels[totalsFut.indexOf(Math.max(...totalsFut))],
      lowStock: products.filter((p) => p.count <= 8).map((p) => p.name).slice(0, 5),
    },
  };
}
