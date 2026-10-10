"use client";
import { useState } from "react";
import { readImageFile } from "@/lib/image";
import { isArt } from "@/lib/art";

const input =
  "w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/25 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50";
const label = "block text-sm font-medium text-[#3c6ca8]/80 mb-1";

const blank = { name: "", category: "", shortDescription: "", description: "", price: "", count: "", image: "", imageType: "" };

/**
 * Shared create/edit form. `onSubmit(values)` must resolve to { success, message }.
 * Numeric fields are kept as strings while typing and validated on submit.
 */
export const ProductForm = ({ initial, categories = [], submitLabel = "Save product", onSubmit, onCancel }) => {
  const [v, setV] = useState(() => {
    const start = { ...blank, ...(initial || {}) };
    if (isArt(start.image)) start.image = "";
    return start;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl, type } = await readImageFile(file);
      setV((s) => ({ ...s, image: dataUrl, imageType: type }));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(v.price);
    const count = v.count === "" ? 0 : Number(v.count);
    if (!v.name.trim()) return setError("Please enter a product name");
    if (!v.category.trim()) return setError("Please enter a category");
    if (!Number.isFinite(price) || price <= 0) return setError("Enter a price greater than 0");
    if (!Number.isInteger(count) || count < 0) return setError("Stock must be a whole number, 0 or more");
    setError("");
    setBusy(true);
    const res = await onSubmit({
      name: v.name.trim(),
      category: v.category.trim(),
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      price,
      count,
      image: v.image,
      imageType: v.imageType,
    });
    setBusy(false);
    if (!res.success) setError(res.message || "Something went wrong");
  };

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="Product form">
      <div>
        <span className={label}>Product image</span>
        <div className="border-2 border-dashed border-[#3c6ca8]/30 rounded-lg p-3 text-center relative">
          {v.image ? (
            <div className="relative mx-auto max-w-[240px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.image} alt="Product preview" className="rounded-md object-contain w-full max-h-52" />
              <button type="button" onClick={() => setV((s) => ({ ...s, image: "", imageType: "" }))} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 text-white" aria-label="Remove image">✕</button>
            </div>
          ) : (
            <label className="block py-6 cursor-pointer text-sm text-[#3c6ca8]/70">
              Click to upload an image (PNG, JPG, GIF or WEBP, max 5MB)
              <br />
              <span className="text-xs text-[#3c6ca8]/50">No image? A tidy illustration is used automatically.</span>
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pickImage} className="sr-only" aria-label="Upload product image" />
            </label>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="pf-name" className={label}>Product name</label>
        <input id="pf-name" className={input} value={v.name} onChange={set("name")} maxLength={120} required />
      </div>
      <div>
        <label htmlFor="pf-cat" className={label}>Category</label>
        <input id="pf-cat" className={input} value={v.category} onChange={set("category")} list="pf-cats" maxLength={60} required />
        <datalist id="pf-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      <div>
        <label htmlFor="pf-short" className={label}>Short description</label>
        <input id="pf-short" className={input} value={v.shortDescription} onChange={set("shortDescription")} maxLength={200} />
      </div>
      <div>
        <label htmlFor="pf-desc" className={label}>Description</label>
        <textarea id="pf-desc" className={`${input} min-h-[90px]`} value={v.description} onChange={set("description")} maxLength={2000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pf-price" className={label}>Price (₹)</label>
          <input id="pf-price" type="number" min="1" step="1" className={input} value={v.price} onChange={set("price")} required />
        </div>
        <div>
          <label htmlFor="pf-count" className={label}>In stock</label>
          <input id="pf-count" type="number" min="0" step="1" className={input} value={v.count} onChange={set("count")} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#3c6ca8]/30 text-[#3c6ca8] hover:bg-[#3c6ca8]/10">Cancel</button>}
        <button type="submit" disabled={busy} className="px-5 py-2 rounded-lg bg-[#3c6ca8] text-white font-semibold hover:bg-[#2c5f8c] disabled:opacity-60">
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};
