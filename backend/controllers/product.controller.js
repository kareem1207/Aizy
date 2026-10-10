const MAX_IMAGE = 5 * 1024 * 1024;

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const repo = (req) => req.app.locals.repos.products;

/** Validates and normalises product fields. Returns { value } or { error }. */
function parseProduct(body, base = {}) {
  const src = { ...base, ...body };
  const name = str(src.name, 120);
  const category = str(src.category, 60);
  const price = Number(src.price);
  const count = src.count === undefined || src.count === "" ? 0 : Number(src.count);
  const rating = src.rating === undefined || src.rating === "" ? 0 : Number(src.rating);
  const image = typeof src.image === "string" ? src.image : "";

  if (!name || !category) return { error: "Name and category are required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a positive number" };
  if (!Number.isInteger(count) || count < 0) return { error: "Stock must be a whole number" };
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return { error: "Rating must be between 0 and 5" };
  if (image.length > MAX_IMAGE) return { error: "Image size too large. Please upload an image smaller than 5MB." };
  if (image && !image.startsWith("data:image/")) return { error: "Image must be an image data URL" };

  return {
    value: {
      name,
      category,
      price,
      count,
      rating,
      shortDescription: str(src.shortDescription, 200),
      description: str(src.description, 2000),
      image,
      imageType: str(src.imageType, 40) || "image/jpeg",
    },
  };
}

const guard = (fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (error) {
    console.error("Product route error:", error.message);
    return fail(res, 500, "Internal server error");
  }
};

export const getProducts = guard(async (req, res) => {
  res.status(200).json({ success: true, products: await repo(req).list() });
});

export const getProductById = guard(async (req, res) => {
  const product = await repo(req).getById(req.params.id);
  if (!product) return fail(res, 404, "Product not found");
  res.status(200).json({ success: true, product });
});

export const getProductImage = guard(async (req, res) => {
  const product = await repo(req).getById(req.params.id);
  if (!product || !product.image) return fail(res, 404, "Product image not found");
  res.status(200).json({ success: true, image: product.image, imageType: product.imageType || "image/jpeg" });
});

export const addProduct = guard(async (req, res) => {
  const parsed = parseProduct(req.body);
  if (parsed.error) return fail(res, 400, parsed.error);
  // Ownership always comes from the verified token, never from the request body.
  const product = await repo(req).create({
    ...parsed.value,
    sellersName: req.user.username,
    sellersEmail: req.user.email,
  });
  res.status(201).json({ success: true, message: "Product created successfully", product });
});

export const updateProduct = guard(async (req, res) => {
  const existing = await repo(req).getById(req.params.id);
  if (!existing) return fail(res, 404, "Product not found");
  if (req.user.role !== "admin" && existing.sellersEmail !== req.user.email)
    return fail(res, 403, "You can only modify your own products");
  const parsed = parseProduct(req.body, existing);
  if (parsed.error) return fail(res, 400, parsed.error);
  const product = await repo(req).update(req.params.id, parsed.value);
  res.status(200).json({ success: true, message: "Product updated successfully", product });
});

export const deleteProduct = guard(async (req, res) => {
  const existing = await repo(req).getById(req.params.id);
  if (!existing) return fail(res, 404, "Product not found");
  if (req.user.role !== "admin" && existing.sellersEmail !== req.user.email)
    return fail(res, 403, "You can only modify your own products");
  await repo(req).delete(req.params.id);
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

export const getProductsByEmail = guard(async (req, res) => {
  res.status(200).json({ success: true, products: await repo(req).bySeller(req.params.email) });
});

export const getProductsByCategory = guard(async (req, res) => {
  res.status(200).json({ success: true, products: await repo(req).byCategory(req.params.category) });
});

export const getProductsByRating = guard(async (req, res) => {
  const min = Number(req.params.rating);
  if (!Number.isFinite(min)) return fail(res, 400, "Invalid rating");
  res.status(200).json({ success: true, products: await repo(req).byMinRating(min) });
});
