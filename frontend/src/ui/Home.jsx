"use client";

import { useEffect, useMemo, useState } from "react";
import { BsRobot } from "react-icons/bs";
import { Card } from "@/components/Card";
import { Chat } from "@/components/Chat";
import { SearchBar } from "@/components/SearchBar";
import { useProductStore } from "@/store/productStore";

const SORTS = {
  featured: { label: "Featured", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  rating: { label: "Top rated", fn: (a, b) => (b.rating || 0) - (a.rating || 0) },
  newest: { label: "Newest", fn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
};

const Home = () => {
  const getProducts = useProductStore((s) => s.getProducts);
  const products = useProductStore((s) => s.products);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [aiChat, setAiChat] = useState(false);

  const load = async () => {
    setStatus("loading");
    const res = await getProducts();
    if (res.success) setStatus("ready");
    else {
      setError(res.message || "Failed to load products");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (inStockOnly && p.count <= 0) return false;
      if (!q) return true;
      return [p.name, p.description, p.shortDescription, p.category, p.sellersName]
        .some((f) => String(f || "").toLowerCase().includes(q));
    });
    const fn = SORTS[sort].fn;
    if (fn) list = [...list].sort(fn);
    return list;
  }, [products, query, category, sort, inStockOnly]);

  const searching = query.trim().length > 0;

  return (
    <>
      <main className="min-h-screen bg-[#fffcf6] pb-24">
        {!searching && category === "All" && (
          <section className="container mx-auto px-4 sm:px-8 pt-10 pb-6">
            <h1 className="text-4xl sm:text-6xl text-[#3c6ca8] leading-tight font-light">
              Less effort,
              <br />
              More elegance.
            </h1>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#3c6ca8]">Powered by AI magic.</p>
            <p className="mt-3 max-w-xl text-[#3c6ca8]/80">
              Shop {products.length || "our"} products across fashion, tech and home, or ask the AI stylist what to wear for any occasion.
            </p>
            <button onClick={() => setAiChat(true)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c] shadow">
              <BsRobot /> Ask the AI stylist
            </button>
          </section>
        )}

        <section className="container mx-auto px-4 sm:px-8 py-4 space-y-4">
          <SearchBar onSearch={setQuery} />

          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Categories">
            {["All", ...categories.map(([c]) => c)].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm border transition ${category === c ? "bg-[#3c6ca8] text-white border-[#3c6ca8]" : "border-[#3c6ca8]/30 text-[#3c6ca8] hover:bg-[#3c6ca8]/10"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#3c6ca8]">
            <p data-testid="result-count">
              {searching ? `Results for “${query.trim()}”: ` : ""}
              {visible.length} product{visible.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-[#3c6ca8]" />
                In stock only
              </label>
              <label className="inline-flex items-center gap-2">
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-[#3c6ca8]/30 rounded-lg bg-white px-2 py-1.5 text-gray-800">
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-8">
          {status === "loading" ? (
            <div className="flex justify-center items-center h-64" role="status" aria-label="Loading products">
              <div className="w-14 h-14 border-4 border-[#3c6ca8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : status === "error" ? (
            <div className="text-center py-16" role="alert">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-gray-500 mt-1">Check that the backend is running, then try again.</p>
              <button onClick={load} className="mt-4 px-5 py-2 rounded-lg bg-[#3c6ca8] text-white hover:bg-[#2c5f8c]">Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 text-[#3c6ca8]/70">
              <p className="text-lg font-medium">{searching ? `No products found for “${query.trim()}”` : "No products available"}</p>
              <p className="text-sm mt-1">{searching ? "Try different keywords or clear the filters." : "Check back later for new products."}</p>
            </div>
          ) : (
            <Card card={visible} />
          )}
        </section>
      </main>

      <button
        onClick={() => setAiChat((v) => !v)}
        aria-label={aiChat ? "Close AI stylist" : "Open AI stylist"}
        className="fixed bottom-6 right-6 z-[65] w-14 h-14 flex items-center justify-center rounded-full bg-[#3c6ca8] text-white shadow-2xl border-4 border-white hover:bg-[#2c5f8c] hover:scale-110 transition"
      >
        <BsRobot className="text-2xl" />
      </button>
      {aiChat && <Chat close={setAiChat} />}
    </>
  );
};

export default Home;
