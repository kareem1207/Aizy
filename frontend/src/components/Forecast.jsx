"use client";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineClose, AiOutlineRise } from "react-icons/ai";
import { BsGraphUp } from "react-icons/bs";
import { useAIStore } from "@/store/aiStore";
import { formatINR } from "@/lib/format";

const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);
const top = (obj, n = 5) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
const monthLabel = (k) => {
  const [y, m] = String(k).split("-");
  return new Date(Date.UTC(+y, +m - 1, 1)).toLocaleString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });
};
const compact = (n) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const LineChart = ({ labels, futureLabels, history, forecast }) => {
  const W = 640;
  const H = 240;
  const pad = { l: 48, r: 12, t: 12, b: 28 };
  const all = [...history, ...forecast];
  const max = Math.max(1, ...all) * 1.08;
  const n = history.length + forecast.length;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (n - 1);
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const histPts = history.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const futPts = [history[history.length - 1], ...forecast].map((v, i) => `${x(history.length - 1 + i)},${y(v)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const every = Math.ceil(n / 8);
  const allLabels = [...labels, ...futureLabels];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Monthly revenue history and forecast">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#3c6ca8" strokeOpacity=".12" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#6b7280">{compact(t)}</text>
        </g>
      ))}
      <rect x={x(history.length - 1)} y={pad.t} width={W - pad.r - x(history.length - 1)} height={H - pad.t - pad.b} fill="#3c6ca8" opacity=".06" />
      <polyline points={histPts} fill="none" stroke="#3c6ca8" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={futPts} fill="none" stroke="#9333ea" strokeWidth="2.5" strokeDasharray="6 5" strokeLinejoin="round" />
      {allLabels.map((l, i) =>
        i % every === 0 ? (
          <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{monthLabel(l)}</text>
        ) : null
      )}
    </svg>
  );
};

const Rank = ({ rows, tone }) => (
  <ol className="space-y-2">
    {rows.map(([name, value], i) => (
      <li key={name} className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100">
        <span className="flex items-center gap-3 min-w-0">
          <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white ${["bg-yellow-500", "bg-gray-400", "bg-amber-600"][i] || "bg-gray-300"}`}>{i + 1}</span>
          <span className="font-medium text-gray-700 truncate">{name}</span>
        </span>
        <span className={`font-bold ${tone}`}>{formatINR(value)}</span>
      </li>
    ))}
  </ol>
);

export const Forecast = ({ onClose }) => {
  const getSalesForecast = useAIStore((s) => s.getSalesForecast);
  const [months, setMonths] = useState(3);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (m = months) => {
    setLoading(true);
    setError(null);
    try {
      setData(await getSalesForecast(m));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totals = useMemo(() => (data ? { sales: sum(data.sales_forecasts), profit: sum(data.profit_forecasts) } : null), [data]);
  const series = data?.series;
  const growth = data?.insights?.growthPct;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Sales forecast">
      <div className="bg-[#fffcf6] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-[#3c6ca8] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BsGraphUp className="text-xl" />
            <h2 className="text-xl font-semibold">Sales forecast</h2>
          </div>
          <button onClick={onClose} aria-label="Close forecast" className="p-2 hover:bg-white/20 rounded-full"><AiOutlineClose /></button>
        </div>

        <div className="p-5 overflow-y-auto">
          {!data && (
            <div className="text-center py-10">
              <BsGraphUp className="text-5xl text-[#3c6ca8]/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">Forecast your next months</h3>
              <p className="text-gray-500 text-sm mb-5">Revenue and profit projections for every product, with a trend chart.</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <label htmlFor="months" className="text-sm text-gray-600">Months ahead</label>
                <select id="months" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
                  {[3, 6, 9, 12].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {error && <p role="alert" className="text-red-600 text-sm mb-3 max-w-md mx-auto">{error}</p>}
              <button onClick={() => run()} disabled={loading} className="px-7 py-2.5 rounded-lg bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c] disabled:opacity-60">
                {loading ? "Analysing…" : error ? "Try again" : "Generate forecast"}
              </button>
            </div>
          )}

          {data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800 font-medium">Revenue, next {data.months_forecasted || months} months</p>
                  <p className="text-2xl font-bold text-green-700" data-testid="fc-revenue">{formatINR(totals.sales)}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Projected profit</p>
                  <p className="text-2xl font-bold text-blue-700">{formatINR(totals.profit)}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">Top performer</p>
                  <p className="text-lg font-bold text-purple-700 truncate" data-testid="fc-best">{data.best_overall_product || "N/A"}</p>
                </div>
              </div>

              {series && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Monthly revenue</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><i className="w-4 h-0.5 bg-[#3c6ca8] inline-block" /> History</span>
                      <span className="inline-flex items-center gap-1"><i className="w-4 border-t-2 border-dashed border-purple-600 inline-block" /> Forecast</span>
                    </div>
                  </div>
                  <LineChart {...series} />
                </div>
              )}

              {!series && data.plot_urls && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(data.plot_urls).map(([k, url]) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={url} alt={k.replace(/_/g, " ")} className="w-full rounded-xl border bg-white" />
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <h3 className="font-semibold text-gray-800 mb-3">Top products by revenue</h3>
                  <Rank rows={top(data.sales_forecasts)} tone="text-green-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <h3 className="font-semibold text-gray-800 mb-3">Top products by profit</h3>
                  <Rank rows={top(data.profit_forecasts)} tone="text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#3c6ca8]/20">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><AiOutlineRise className="text-[#3c6ca8]" /> What this means</h3>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                  <li>Lead your marketing with <strong>{data.best_overall_product}</strong>, your strongest projected seller.</li>
                  {typeof growth === "number" && (
                    <li>Revenue over the last 6 months is {growth >= 0 ? "up" : "down"} <strong>{Math.abs(growth)}%</strong> on the 6 months before.</li>
                  )}
                  {data.insights?.peakMonth && <li>The busiest forecast month is <strong>{monthLabel(data.insights.peakMonth)}</strong>. Stock up beforehand.</li>}
                  {data.insights?.lowStock?.length > 0 && <li>Low stock to restock: {data.insights.lowStock.join(", ")}.</li>}
                </ul>
                <p className="text-xs text-gray-400 mt-3">Projections are estimates from the data available and are not guarantees.</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <select aria-label="Months ahead" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
                  {[3, 6, 9, 12].map((m) => <option key={m} value={m}>{m} months</option>)}
                </select>
                <button onClick={() => run()} disabled={loading} className="px-5 py-2 rounded-lg bg-[#3c6ca8] text-white hover:bg-[#2c5f8c] disabled:opacity-60">
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
