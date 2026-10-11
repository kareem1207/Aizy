// In-browser demo backend. It answers the same routes, with the same response
// shapes, as the Express API (/auth, /api/products, /api/orders) and the FastAPI
// service (/ai/*), keeping its data in localStorage so the app runs with no
// database or server. Nothing here is secure: it is for demos and tests only.
import { buildSeedProducts, DEMO_PASSWORD, DEMO_USERS } from "./seed";
import { productArt, isArt } from "../art";
import { answer } from "./fashion";
import { buildForecast } from "./forecast";
import { decodeToken, makeDemoToken } from "../token";

export const DB_KEY = "aizy_demo_db_v1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let memory = null;

function storage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

async function hashPassword(pw, salt = "aizy-demo") {
  try {
    const data = new TextEncoder().encode(`${salt}:${pw}`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (const c of `${salt}:${pw}`) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return `x${h}`;
  }
}

async function freshDb() {
  const pw = await hashPassword(DEMO_PASSWORD);
  return {
    v: 1,
    users: DEMO_USERS.map((u) => ({ ...u, pw, profilePicture: null })),
    banned: [],
    products: buildSeedProducts(),
    orders: [],
    otps: {},
    nextUserId: DEMO_USERS.length + 1,
    nextProductId: 1000,
    nextBanId: 1,
    nextOrderId: 1,
  };
}

async function load() {
  if (memory) return memory;
  const s = storage();
  if (s) {
    try {
      const raw = s.getItem(DB_KEY);
      if (raw) {
        const db = JSON.parse(raw);
        if (db && db.v === 1) return (memory = db);
      }
    } catch {
      /* fall through to a fresh database */
    }
  }
  memory = await freshDb();
  persist();
  return memory;
}

function persist() {
  const s = storage();
  if (!s || !memory) return;
  try {
    s.setItem(DB_KEY, JSON.stringify(memory));
  } catch {
    /* quota or private mode: stay in memory */
  }
}

export async function resetDemoDb() {
  memory = await freshDb();
  persist();
  return memory;
}

/** Test helper: forget the in-memory copy so the next call reloads from storage. */
export function _dropMemory() {
  memory = null;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const fail = (status, message, extra = {}) => json(status, { success: false, message, ...extra });

const publicUser = ({ pw, ...rest }) => rest;
const productView = (p) => ({ ...p, image: p.image || productArt(p.category, p.name) });

function authOf(init) {
  const h = init?.headers || {};
  const raw = typeof h.get === "function" ? h.get("Authorization") : h.Authorization || h.authorization;
  const token = raw && String(raw).startsWith("Bearer ") ? String(raw).slice(7) : null;
  const payload = decodeToken(token);
  return payload && payload.userId ? payload : null;
}

function readBody(init) {
  if (!init?.body) return {};
  try {
    return typeof init.body === "string" ? JSON.parse(init.body) : init.body;
  } catch {
    return {};
  }
}

const clean = (s) => String(s ?? "").trim();
const cap = (s, n) => clean(s).slice(0, n);

function activeBan(db, userId) {
  const ban = db.banned.find((b) => b.userId === userId);
  if (!ban) return null;
  if (ban.bannedUntil && new Date() > new Date(ban.bannedUntil)) {
    db.banned = db.banned.filter((b) => b.userId !== userId);
    return null;
  }
  return ban;
}

/* ---------------------------------- auth --------------------------------- */

async function register(db, body) {
  const name = cap(body.name, 80);
  const email = clean(body.email).toLowerCase();
  const role = body.role || "customer";
  if (!name || !email || !body.password) return fail(400, "Please provide all required fields");
  if (!EMAIL_RE.test(email)) return fail(400, "Invalid email format");
  if (!["customer", "seller"].includes(role)) return fail(400, "Invalid role");
  if (String(body.password).length < 8) return fail(400, "Password must be at least 8 characters");
  if (!proofOk(db, body.proof, email)) return fail(400, "Please verify your email first");
  if (db.users.some((u) => u.email === email && u.role === role))
    return fail(400, "User with this email already exists");
  const user = {
    id: db.nextUserId++,
    name,
    email,
    role,
    pw: await hashPassword(body.password),
    profilePicture: null,
  };
  db.users.push(user);
  persist();
  return json(201, { success: true, message: "User created successfully", data: publicUser(user), token: tokenFor(user) });
}

async function login(db, body) {
  const email = clean(body.email).toLowerCase();
  if (!email || !body.password) return fail(400, "Email and password are required");
  const candidates = db.users.filter((u) => u.email === email);
  const user = body.role ? candidates.find((u) => u.role === body.role) : candidates[0];
  if (!user) return fail(401, "Invalid email or password");
  const ban = activeBan(db, user.id);
  if (ban) {
    persist();
    return fail(403, "Your account has been banned", { reason: ban.reason, bannedUntil: ban.bannedUntil });
  }
  if (user.pw !== (await hashPassword(body.password))) return fail(401, "Invalid email or password");
  persist();
  return json(200, { success: true, message: "Login successful", data: publicUser(user), token: tokenFor(user) });
}

const tokenFor = (user) =>
  makeDemoToken({ userId: user.id, username: user.name, email: user.email, role: user.role });

// A verified-email proof is a one-shot random string kept alongside the OTP records.
function proofOk(db, proof, email) {
  const rec = db.proofs?.[email];
  if (!proof || !rec || rec.proof !== proof || rec.exp < Date.now()) return false;
  delete db.proofs[email];
  return true;
}

function generateOtp(db, body) {
  const email = clean(body.email).toLowerCase();
  if (!EMAIL_RE.test(email)) return fail(400, "A valid email is required");
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  db.otps[email] = { otp, exp: Date.now() + 5 * 60 * 1000, tries: 0 };
  persist();
  // No email service in demo mode, so the code is returned for on-screen display.
  return json(200, { success: true, message: "OTP generated (demo mode: shown on screen)", demoOtp: otp });
}

function verifyOtp(db, body) {
  const email = clean(body.email).toLowerCase();
  const rec = db.otps[email];
  if (!rec || rec.exp < Date.now()) return fail(400, "OTP expired. Please request a new one.");
  rec.tries += 1;
  if (rec.tries > 5) {
    delete db.otps[email];
    persist();
    return fail(429, "Too many attempts. Please request a new OTP.");
  }
  if (rec.otp !== clean(body.otp)) {
    persist();
    return fail(400, "Invalid OTP!");
  }
  delete db.otps[email];
  const proof = Math.random().toString(36).slice(2) + Date.now().toString(36);
  db.proofs = { ...(db.proofs || {}), [email]: { proof, exp: Date.now() + 15 * 60 * 1000 } };
  persist();
  return json(200, { success: true, message: "OTP verified", proof });
}

/* ------------------------------- users/admin ------------------------------ */

const needAdmin = (auth) => (!auth ? fail(401, "Authentication required") : auth.role !== "admin" ? fail(403, "Admin access required") : null);

function banUser(db, auth, body) {
  const denied = needAdmin(auth);
  if (denied) return denied;
  const userId = Number(body.userId);
  if (!userId) return fail(400, "User ID is required");
  const user = db.users.find((u) => u.id === userId);
  if (!user) return fail(404, "User not found");
  if (user.role === "admin") return fail(400, "Admins cannot be banned");
  if (db.banned.some((b) => b.userId === userId)) return fail(400, "User is already banned");
  let bannedUntil = null;
  const days = parseInt(body.banDuration, 10);
  if (days > 0) bannedUntil = new Date(Date.now() + days * 86400000).toISOString();
  const ban = {
    id: db.nextBanId++,
    userId,
    email: user.email,
    name: user.name,
    reason: cap(body.reason, 200) || "Violation of terms of service",
    bannedUntil,
    createdAt: new Date().toISOString(),
  };
  db.banned.push(ban);
  persist();
  return json(200, { success: true, message: "User banned successfully", data: ban });
}

function unbanUser(db, auth, body) {
  const denied = needAdmin(auth);
  if (denied) return denied;
  const userId = Number(body.userId);
  if (!userId) return fail(400, "User ID is required");
  if (!db.banned.some((b) => b.userId === userId)) return fail(400, "This user is not banned");
  db.banned = db.banned.filter((b) => b.userId !== userId);
  persist();
  return json(200, { success: true, message: "User unbanned successfully" });
}

async function createAdmin(db, auth, body) {
  const denied = needAdmin(auth);
  if (denied) return denied;
  const name = cap(body.name, 80);
  const email = clean(body.email).toLowerCase();
  if (!name || !email || !body.password) return fail(400, "All fields are required");
  if (Number(body.adminId) !== auth.userId) return fail(403, "Admin ID does not match the signed-in admin");
  if (!EMAIL_RE.test(email)) return fail(400, "Invalid email format");
  if (String(body.password).length < 8) return fail(400, "Password must be at least 8 characters");
  if (db.users.some((u) => u.email === email && u.role === "admin"))
    return fail(400, "An admin with this email already exists");
  const user = { id: db.nextUserId++, name, email, role: "admin", pw: await hashPassword(body.password), profilePicture: null };
  db.users.push(user);
  persist();
  return json(201, { success: true, message: "Admin created successfully", data: publicUser(user) });
}

/* -------------------------------- products -------------------------------- */

function validProduct(body) {
  const name = cap(body.name, 120);
  const category = cap(body.category, 60);
  const price = Number(body.price);
  const count = body.count === undefined || body.count === "" ? 0 : Number(body.count);
  if (!name || !category) return { error: "Name and category are required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a positive number" };
  if (!Number.isInteger(count) || count < 0) return { error: "Stock must be a whole number" };
  const rating = body.rating === undefined || body.rating === "" ? 0 : Number(body.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return { error: "Rating must be between 0 and 5" };
  const image = typeof body.image === "string" && !isArt(body.image) ? body.image : "";
  if (image.length > 5 * 1024 * 1024) return { error: "Image size too large. Please upload an image smaller than 5MB." };
  return {
    value: {
      name,
      category,
      price,
      count,
      rating,
      shortDescription: cap(body.shortDescription, 200),
      description: cap(body.description, 2000),
      image,
      imageType: cap(body.imageType, 40) || "image/jpeg",
    },
  };
}

function productRoute(db, auth, method, parts, init) {
  const body = readBody(init);
  const [first, second] = parts;

  if (method === "GET" && parts.length === 0)
    return json(200, { success: true, products: db.products.map(productView) });

  if (method === "POST" && first === "create") {
    if (!auth) return fail(401, "Authentication required");
    if (!["seller", "admin"].includes(auth.role)) return fail(403, "Only sellers can create products");
    const v = validProduct(body);
    if (v.error) return fail(400, v.error);
    const now = new Date().toISOString();
    const product = {
      _id: `demo${String(db.nextProductId++).padStart(4, "0")}`,
      ...v.value,
      sellersName: auth.username,
      sellersEmail: auth.email,
      createdAt: now,
      updatedAt: now,
    };
    db.products.unshift(product);
    persist();
    return json(201, { success: true, message: "Product created successfully", product: productView(product) });
  }

  if (method === "GET" && first === "category" && second)
    return json(200, {
      success: true,
      products: db.products.filter((p) => p.category.toLowerCase() === decodeURIComponent(second).toLowerCase()).map(productView),
    });

  if (method === "GET" && first === "rating" && second) {
    const min = Number(second);
    if (!Number.isFinite(min)) return fail(400, "Invalid rating");
    return json(200, { success: true, products: db.products.filter((p) => p.rating >= min).map(productView) });
  }

  if (method === "GET" && first === "seller" && second) {
    const email = decodeURIComponent(second).toLowerCase();
    return json(200, { success: true, products: db.products.filter((p) => p.sellersEmail.toLowerCase() === email).map(productView) });
  }

  if (method === "GET" && first === "image" && second) {
    const p = db.products.find((x) => x._id === second);
    if (!p) return fail(404, "Product image not found");
    return json(200, { success: true, image: productView(p).image, imageType: p.imageType });
  }

  const product = first ? db.products.find((p) => p._id === first) : null;

  if (method === "GET" && first) {
    if (!product) return fail(404, "Product not found");
    return json(200, { success: true, product: productView(product) });
  }

  if (method === "PUT" || method === "DELETE") {
    if (!auth) return fail(401, "Authentication required");
    if (!product) return fail(404, "Product not found");
    if (auth.role !== "admin" && product.sellersEmail !== auth.email)
      return fail(403, "You can only modify your own products");
    if (method === "DELETE") {
      db.products = db.products.filter((p) => p._id !== product._id);
      persist();
      return json(200, { success: true, message: "Product deleted successfully" });
    }
    const v = validProduct({ ...product, ...body });
    if (v.error) return fail(400, v.error);
    Object.assign(product, v.value, { updatedAt: new Date().toISOString() });
    persist();
    return json(200, { success: true, message: "Product updated successfully", product: productView(product) });
  }

  return fail(404, "Route not found");
}

/* --------------------------------- orders --------------------------------- */

function orderRoute(db, auth, method, parts, init) {
  if (!auth) return fail(401, "Authentication required");
  const body = readBody(init);

  if (method === "POST" && parts.length === 0) {
    const wanted = Array.isArray(body.items) ? body.items : [];
    if (!wanted.length) return fail(400, "Your cart is empty");
    if (wanted.length > 50) return fail(400, "Too many items in one order");
    const lines = [];
    for (const w of wanted) {
      const qty = Number(w.qty);
      const p = db.products.find((x) => x._id === w.productId);
      if (!p) return fail(404, "A product in your cart no longer exists");
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) return fail(400, "Invalid quantity");
      if (p.count < qty) return fail(409, `Only ${p.count} left of ${p.name}`);
      lines.push({ p, qty });
    }
    lines.forEach(({ p, qty }) => (p.count -= qty));
    const order = {
      id: `AZ-${String(db.nextOrderId++).padStart(5, "0")}`,
      userId: auth.userId,
      userEmail: auth.email,
      date: new Date().toISOString(),
      status: "Placed (demo, no payment taken)",
      items: lines.map(({ p, qty }) => ({
        productId: p._id,
        name: p.name,
        qty,
        price: p.price,
        sellersEmail: p.sellersEmail,
      })),
    };
    order.total = order.items.reduce((a, i) => a + i.qty * i.price, 0);
    db.orders.unshift(order);
    persist();
    return json(201, { success: true, message: "Order placed", order });
  }

  if (method === "GET" && parts[0] === "mine")
    return json(200, { success: true, orders: db.orders.filter((o) => o.userId === auth.userId) });

  if (method === "GET" && parts[0] === "seller") {
    if (!["seller", "admin"].includes(auth.role)) return fail(403, "Seller access required");
    const mine = (o) => auth.role === "admin" || o.items.some((i) => i.sellersEmail === auth.email);
    return json(200, { success: true, orders: db.orders.filter(mine) });
  }
  return fail(404, "Route not found");
}

/* ----------------------------------- ai ----------------------------------- */

function aiRoute(db, auth, method, parts, init) {
  const body = readBody(init);
  const key = parts.join("/");

  if (method === "GET" && key === "health")
    return json(200, { status: "healthy", mode: "demo", models: { fashion: true, sales: true } });

  if (method === "POST" && key === "fashion/query") {
    const prompt = cap(body.prompt, 500);
    if (!prompt) return fail(400, "Please describe what you are looking for");
    const res = answer(prompt, db.products.map(productView));
    return json(200, {
      success: true,
      message: "Fashion recommendation generated",
      data: { recommendation: res.message, picks: res.picks, products: res.products },
    });
  }

  if (method === "POST" && key === "sales/forecast") {
    let list = db.products;
    if (auth?.role === "seller") list = list.filter((p) => p.sellersEmail === auth.email);
    if (!list.length) return fail(404, "No products to forecast yet. Add a product first.");
    const orders = db.orders.map((o) => ({ date: o.date, items: o.items }));
    const forecast = buildForecast(list, orders, body.months_to_forecast || 3);
    return json(200, { success: true, message: "Sales forecast generated successfully", data: { forecast } });
  }
  return fail(404, "Route not found");
}

/* --------------------------------- router --------------------------------- */

export async function demoFetch(path, init = {}) {
  const db = await load();
  const method = (init.method || "GET").toUpperCase();
  const url = new URL(path, "http://demo.local");
  const segs = url.pathname.split("/").filter(Boolean);
  const auth = authOf(init);

  // Pending auth lookups must still honour bans and removed accounts.
  if (auth) {
    const u = db.users.find((x) => x.id === auth.userId);
    if (!u || activeBan(db, u.id)) return fail(401, "Session is no longer valid");
  }

  try {
    if (segs[0] === "auth") {
      const route = segs.slice(1).join("/");
      const body = readBody(init);
      if (method === "POST" && route === "register") return await register(db, body);
      if (method === "POST" && route === "login") return await login(db, body);
      if (method === "POST" && route === "generate-otp") return generateOtp(db, body);
      if (method === "POST" && route === "verify-otp") return verifyOtp(db, body);
      if (route === "users" && method === "GET") {
        const denied = needAdmin(auth);
        return denied || json(200, { success: true, data: db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })) });
      }
      if (route === "banned-users" && method === "GET") {
        const denied = needAdmin(auth);
        return denied || json(200, { success: true, data: db.banned });
      }
      if (method === "POST" && route === "ban-user") return banUser(db, auth, body);
      if (method === "POST" && route === "unban-user") return unbanUser(db, auth, body);
      if (method === "POST" && route === "create-admin") return await createAdmin(db, auth, body);
      if (route === "profile" && method === "GET") {
        if (!auth) return fail(401, "Authentication required");
        const u = db.users.find((x) => x.id === auth.userId);
        return u ? json(200, { success: true, data: publicUser(u) }) : fail(404, "User not found");
      }
      if (route === "update-profile" && method === "POST") {
        if (!auth) return fail(401, "Authentication required");
        const u = db.users.find((x) => x.id === auth.userId);
        if (!u) return fail(404, "User not found");
        if (body.profilePicture && body.profilePicture.length > 5 * 1024 * 1024)
          return fail(400, "Profile picture is too large. Please upload an image smaller than 5MB.");
        u.profilePicture = body.profilePicture || u.profilePicture;
        persist();
        return json(200, { success: true, message: "Profile updated successfully", data: publicUser(u) });
      }
      return fail(404, "Route not found");
    }
    if (segs[0] === "api" && segs[1] === "products") return productRoute(db, auth, method, segs.slice(2), init);
    if (segs[0] === "api" && segs[1] === "orders") return orderRoute(db, auth, method, segs.slice(2), init);
    if (segs[0] === "ai") return aiRoute(db, auth, method, segs.slice(1), init);
    return fail(404, "Route not found");
  } catch (err) {
    console.error("[demo backend]", err);
    return fail(500, "Internal server error");
  }
}
