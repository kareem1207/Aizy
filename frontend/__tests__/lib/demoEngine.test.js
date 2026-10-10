/**
 * @jest-environment node
 */
import { demoFetch, resetDemoDb, _dropMemory } from "@/lib/demo/engine";
import { DEMO_PASSWORD } from "@/lib/demo/seed";

const call = async (path, { method = "GET", body, token } = {}) => {
  const res = await demoFetch(path, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

async function login(email, role) {
  const res = await call("/auth/login", { method: "POST", body: { email, password: DEMO_PASSWORD, role } });
  expect(res.status).toBe(200);
  return res.body.token;
}

beforeEach(async () => {
  _dropMemory();
  await resetDemoDb();
});

describe("demo backend: catalogue", () => {
  test("ships a rich catalogue across many categories, each with artwork", async () => {
    const { body } = await call("/api/products");
    expect(body.success).toBe(true);
    expect(body.products.length).toBeGreaterThanOrEqual(40);
    expect(new Set(body.products.map((p) => p.category)).size).toBeGreaterThanOrEqual(8);
    expect(body.products.every((p) => p.image.startsWith("data:image/svg+xml"))).toBe(true);
    expect(body.products.every((p) => p.price > 0 && Number.isInteger(p.count))).toBe(true);
  });

  test("category, rating and seller filters", async () => {
    const shoes = await call("/api/products/category/footwear");
    expect(shoes.body.products.length).toBeGreaterThan(0);
    expect(shoes.body.products.every((p) => p.category === "Footwear")).toBe(true);
    const top = await call("/api/products/rating/4.7");
    expect(top.body.products.every((p) => p.rating >= 4.7)).toBe(true);
    const mine = await call("/api/products/seller/seller%40aizy.demo");
    expect(mine.body.products.length).toBeGreaterThan(5);
    expect((await call("/api/products/rating/abc")).status).toBe(400);
    expect((await call("/api/products/does-not-exist")).status).toBe(404);
  });
});

describe("demo backend: auth", () => {
  test("demo accounts can log in; wrong passwords cannot; the hash never leaks", async () => {
    const ok = await call("/auth/login", { method: "POST", body: { email: "customer@aizy.demo", password: DEMO_PASSWORD, role: "customer" } });
    expect(ok.status).toBe(200);
    expect(ok.body.data.pw).toBeUndefined();
    expect(ok.body.token).toEqual(expect.any(String));
    const bad = await call("/auth/login", { method: "POST", body: { email: "customer@aizy.demo", password: "nope-nope", role: "customer" } });
    expect(bad.status).toBe(401);
    const wrongRole = await call("/auth/login", { method: "POST", body: { email: "customer@aizy.demo", password: DEMO_PASSWORD, role: "admin" } });
    expect(wrongRole.status).toBe(401);
  });

  test("sign-up needs an OTP proof, and the proof is single-use", async () => {
    const email = "new@example.com";
    const reg = (proof) => call("/auth/register", { method: "POST", body: { name: "New", email, password: "longenough", role: "customer", proof } });
    expect((await reg(undefined)).status).toBe(400);

    const gen = await call("/auth/generate-otp", { method: "POST", body: { email } });
    expect(gen.body.demoOtp).toMatch(/^\d{6}$/);
    expect((await call("/auth/verify-otp", { method: "POST", body: { email, otp: "000000" === gen.body.demoOtp ? "111111" : "000000" } })).status).toBe(400);
    const ver = await call("/auth/verify-otp", { method: "POST", body: { email, otp: gen.body.demoOtp } });
    expect(ver.body.proof).toEqual(expect.any(String));

    const done = await reg(ver.body.proof);
    expect(done.status).toBe(201);
    expect(done.body.token).toEqual(expect.any(String));
    expect((await reg(ver.body.proof)).status).toBe(400);
  });

  test("admins cannot be self-registered and short passwords are refused", async () => {
    const email = "x@example.com";
    const gen = await call("/auth/generate-otp", { method: "POST", body: { email } });
    const ver = await call("/auth/verify-otp", { method: "POST", body: { email, otp: gen.body.demoOtp } });
    const base = { name: "X", email, proof: ver.body.proof };
    expect((await call("/auth/register", { method: "POST", body: { ...base, password: "longenough", role: "admin" } })).status).toBe(400);
    expect((await call("/auth/register", { method: "POST", body: { ...base, password: "short", role: "customer" } })).status).toBe(400);
  });

  test("only admins can list users or ban; banning blocks login and sessions", async () => {
    const customer = await login("customer@aizy.demo", "customer");
    const admin = await login("admin@aizy.demo", "admin");
    expect((await call("/auth/users", { token: customer })).status).toBe(403);
    expect((await call("/auth/users")).status).toBe(401);
    const users = await call("/auth/users", { token: admin });
    expect(users.body.data.length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(users.body)).not.toMatch(/"pw"/);

    const victim = users.body.data.find((u) => u.email === "customer@aizy.demo");
    expect((await call("/auth/ban-user", { method: "POST", token: customer, body: { userId: victim.id } })).status).toBe(403);
    expect((await call("/auth/ban-user", { method: "POST", token: admin, body: { userId: victim.id, reason: "spam", banDuration: 3 } })).status).toBe(200);
    expect((await call("/auth/profile", { token: customer })).status).toBe(401);
    const blocked = await call("/auth/login", { method: "POST", body: { email: "customer@aizy.demo", password: DEMO_PASSWORD, role: "customer" } });
    expect(blocked.status).toBe(403);
    expect(blocked.body.reason).toBe("spam");
    expect((await call("/auth/unban-user", { method: "POST", token: admin, body: { userId: victim.id } })).status).toBe(200);
    expect((await call("/auth/profile", { token: customer })).status).toBe(200);

    const adminUser = users.body.data.find((u) => u.role === "admin");
    expect((await call("/auth/ban-user", { method: "POST", token: admin, body: { userId: adminUser.id } })).status).toBe(400);
  });

  test("a tampered or expired token is not trusted", async () => {
    expect((await call("/auth/users", { token: "a.b.c" })).status).toBe(401);
    expect((await call("/auth/profile", { token: "garbage" })).status).toBe(401);
  });
});

describe("demo backend: seller tools and orders", () => {
  test("sellers manage only their own products", async () => {
    const seller = await login("seller@aizy.demo", "seller");
    const other = await login("verve@aizy.demo", "seller");
    const customer = await login("customer@aizy.demo", "customer");
    const create = (token, over = {}) =>
      call("/api/products/create", { method: "POST", token, body: { name: "Test Shirt", category: "Western Wear", price: 999, count: 4, ...over } });

    expect((await create(undefined)).status).toBe(401);
    expect((await create(customer)).status).toBe(403);
    expect((await create(seller, { price: -1 })).status).toBe(400);
    const made = await create(seller, { sellersEmail: "spoof@x.com" });
    expect(made.status).toBe(201);
    expect(made.body.product.sellersEmail).toBe("seller@aizy.demo");

    const id = made.body.product._id;
    expect((await call(`/api/products/${id}`, { method: "PUT", token: other, body: { price: 1 } })).status).toBe(403);
    expect((await call(`/api/products/${id}`, { method: "DELETE", token: other })).status).toBe(403);
    const upd = await call(`/api/products/${id}`, { method: "PUT", token: seller, body: { price: 1200 } });
    expect(upd.body.product.price).toBe(1200);
    expect((await call(`/api/products/${id}`, { method: "DELETE", token: seller })).status).toBe(200);
    expect((await call(`/api/products/${id}`)).status).toBe(404);
  });

  test("orders reduce stock, refuse overselling atomically and appear in the history", async () => {
    const customer = await login("customer@aizy.demo", "customer");
    const list = (await call("/api/products")).body.products;
    const a = list.find((p) => p.count >= 3);
    const b = list.find((p) => p._id !== a._id && p.count >= 2);

    const order = await call("/api/orders", { method: "POST", token: customer, body: { items: [{ productId: a._id, qty: 2 }, { productId: b._id, qty: 1 }] } });
    expect(order.status).toBe(201);
    expect(order.body.order.total).toBe(a.price * 2 + b.price);
    expect((await call(`/api/products/${a._id}`)).body.product.count).toBe(a.count - 2);

    const tooMany = await call("/api/orders", {
      method: "POST",
      token: customer,
      body: { items: [{ productId: b._id, qty: 1 }, { productId: a._id, qty: 20 }] },
    });
    expect([409, 400]).toContain(tooMany.status);
    expect((await call(`/api/products/${b._id}`)).body.product.count).toBe(b.count - 1);

    const mine = await call("/api/orders/mine", { token: customer });
    expect(mine.body.orders).toHaveLength(1);
    expect((await call("/api/orders", { method: "POST", body: { items: [] } })).status).toBe(401);
    expect((await call("/api/orders", { method: "POST", token: customer, body: { items: [] } })).status).toBe(400);
  });
});

describe("demo backend: AI endpoints", () => {
  test("fashion assistant answers and links store products", async () => {
    const res = await call("/ai/fashion/query", { method: "POST", body: { prompt: "outfit for a girl at a wedding" } });
    expect(res.status).toBe(200);
    expect(res.body.data.recommendation).toMatch(/suggest/i);
    expect(res.body.data.picks.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect((await call("/ai/fashion/query", { method: "POST", body: { prompt: "  " } })).status).toBe(400);
  });

  test("sales forecast has the shape the dashboard needs and honours the horizon", async () => {
    const seller = await login("seller@aizy.demo", "seller");
    const res = await call("/ai/sales/forecast", { method: "POST", token: seller, body: { months_to_forecast: 6 } });
    expect(res.status).toBe(200);
    const f = res.body.data.forecast;
    expect(f.months_forecasted).toBe(6);
    expect(f.best_overall_product).toEqual(expect.any(String));
    expect(Object.keys(f.sales_forecasts).length).toBeGreaterThan(5);
    expect(f.series.history).toHaveLength(24);
    expect(f.series.forecast).toHaveLength(6);
    expect(Object.values(f.sales_forecasts).every((v) => v >= 0)).toBe(true);
  });

  test("a seller with no products gets a clear message, not a crash", async () => {
    const gen = async (email) => {
      const g = await call("/auth/generate-otp", { method: "POST", body: { email } });
      return (await call("/auth/verify-otp", { method: "POST", body: { email, otp: g.body.demoOtp } })).body.proof;
    };
    const proof = await gen("fresh@shop.in");
    const reg = await call("/auth/register", { method: "POST", body: { name: "Fresh", email: "fresh@shop.in", password: "longenough", role: "seller", proof } });
    const res = await call("/ai/sales/forecast", { method: "POST", token: reg.body.token, body: {} });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/add a product/i);
  });

  test("unknown routes return a JSON 404", async () => {
    const res = await call("/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
