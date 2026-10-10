"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Forecast } from "@/components/Forecast";
import { ProductForm } from "@/components/ProductForm";
import { useProductStore } from "@/store/productStore";
import { useOrderStore } from "@/store/orderStore";
import { formatINR } from "@/lib/format";
import { decodeToken, getStoredToken } from "@/lib/token";

const Stat = ({ label, value, testid }) => (
  <div className="bg-white rounded-xl border border-[#3c6ca8]/10 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-[#3c6ca8]/60">{label}</p>
    <p className="text-2xl font-bold text-[#3c6ca8]" data-testid={testid}>{value}</p>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-[#fffcf6] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c6ca8]/15">
        <h2 className="text-lg font-semibold text-[#3c6ca8]">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-[#3c6ca8]/10 text-[#3c6ca8]">✕</button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const Seller = () => {
  const { getProductsBySeller, deleteProduct, updateProduct, createProduct } = useProductStore();
  const getSellerOrders = useOrderStore((s) => s.getSellerOrders);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const me = typeof window === "undefined" ? null : decodeToken(getStoredToken());

  const load = useCallback(async () => {
    setLoading(true);
    const [p, o] = await Promise.all([getProductsBySeller(), getSellerOrders()]);
    if (p.success) {
      setProducts(p.data || []);
      setError("");
    } else setError(p.message || "Could not load your products");
    if (o.success) setOrders(o.data);
    setLoading(false);
  }, [getProductsBySeller, getSellerOrders]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const mine = (i) => !me || i.sellersEmail === me.email;
    const sold = orders.flatMap((o) => o.items.filter(mine));
    return {
      units: products.reduce((a, p) => a + p.count, 0),
      value: products.reduce((a, p) => a + p.count * p.price, 0),
      orders: orders.length,
      revenue: sold.reduce((a, i) => a + i.qty * i.price, 0),
    };
  }, [products, orders, me]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const save = async (values) => {
    const res = editing ? await updateProduct(editing._id, values) : await createProduct({ ...values, sellersName: me?.username, sellersEmail: me?.email });
    if (res.success) {
      toast.success(editing ? "Product updated" : "Product created");
      setEditing(null);
      setAdding(false);
      await load();
    }
    return res;
  };

  const remove = async () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    const res = await deleteProduct(target._id);
    if (res.success) {
      toast.success(`${target.name} deleted`);
      await load();
    } else toast.error(res.message);
  };

  return (
    <main className="min-h-screen bg-[#fffcf6] text-[#3c6ca8]">
      <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Seller hub</h1>
            <p className="text-[#3c6ca8]/70 text-sm">{me?.username ? `Signed in as ${me.username}` : "Manage your catalogue"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForecast(true)} disabled={products.length === 0} className="px-4 py-2 rounded-lg border border-[#3c6ca8]/40 hover:bg-[#3c6ca8]/10 disabled:opacity-50">AI sales forecast</button>
            <button onClick={() => setAdding(true)} className="px-4 py-2 rounded-lg bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c]">+ Add product</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Products" value={products.length} testid="stat-products" />
          <Stat label="Units in stock" value={stats.units} testid="stat-units" />
          <Stat label="Orders received" value={stats.orders} testid="stat-orders" />
          <Stat label="Order value" value={formatINR(stats.revenue)} testid="stat-revenue" />
        </div>
        <p className="text-xs text-[#3c6ca8]/60 -mt-3">Inventory value {formatINR(stats.value)}. Order value is the sum of placed orders; no payments are processed.</p>

        <section className="bg-white rounded-2xl border border-[#3c6ca8]/10 shadow-sm">
          <h2 className="px-5 py-4 font-semibold border-b border-[#3c6ca8]/10">Your products</h2>
          {loading ? (
            <p className="p-8 text-center" role="status">Loading…</p>
          ) : error ? (
            <div className="p-8 text-center" role="alert">
              <p className="text-red-600">{error}</p>
              <button onClick={load} className="mt-3 underline">Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg">No products yet</p>
              <button onClick={() => setAdding(true)} className="mt-3 px-4 py-2 rounded-lg bg-[#3c6ca8] text-white">Create your first product</button>
            </div>
          ) : (
            <ul className="divide-y divide-[#3c6ca8]/10">
              {products.map((p) => (
                <li key={p._id} className="flex items-center gap-4 p-4" data-testid="seller-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[#3c6ca8]/70">{p.category} · {formatINR(p.price)} · <span className={p.count <= 5 ? "text-amber-700 font-medium" : ""}>{p.count} in stock</span></p>
                  </div>
                  <button onClick={() => setEditing(p)} className="px-3 py-1.5 text-sm rounded-lg bg-[#3c6ca8]/10 hover:bg-[#3c6ca8]/20" aria-label={`Edit ${p.name}`}>Edit</button>
                  <button onClick={() => setConfirmDelete(p)} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100" aria-label={`Delete ${p.name}`}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {orders.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#3c6ca8]/10 shadow-sm">
            <h2 className="px-5 py-4 font-semibold border-b border-[#3c6ca8]/10">Recent orders</h2>
            <ul className="divide-y divide-[#3c6ca8]/10 text-sm">
              {orders.slice(0, 8).map((o) => (
                <li key={o.id} className="px-5 py-3 flex flex-wrap justify-between gap-2">
                  <span><strong>{o.id}</strong> · {new Date(o.date).toLocaleDateString("en-IN")} · {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                  <span className="font-semibold">{formatINR(o.total)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {(adding || editing) && (
        <Modal title={editing ? "Edit product" : "Add product"} onClose={() => { setAdding(false); setEditing(null); }}>
          <ProductForm
            initial={editing || undefined}
            categories={categories}
            submitLabel={editing ? "Update product" : "Create product"}
            onSubmit={save}
            onCancel={() => { setAdding(false); setEditing(null); }}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete product?" onClose={() => setConfirmDelete(null)}>
          <p className="text-gray-700 mb-5">“{confirmDelete.name}” will be removed from the store. This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-[#3c6ca8]/30">Keep it</button>
            <button onClick={remove} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}

      {showForecast && <Forecast onClose={() => setShowForecast(false)} />}
    </main>
  );
};
