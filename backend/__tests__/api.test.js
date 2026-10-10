import { jest } from "@jest/globals";
import request from "supertest";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-for-jest";

const { createApp } = await import("../appFactory.js");
const { createMemoryRepos } = await import("../repositories/memory.js");
const { _resetOtps } = await import("../services/otp.service.js");

jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

let repos;
let app;
let seq = 0;

beforeEach(() => {
  _resetOtps();
  repos = createMemoryRepos();
  app = createApp(repos);
});

const newEmail = (p = "u") => `${p}${++seq}@example.com`;

async function verifiedProof(email) {
  const gen = await request(app).post("/auth/generate-otp").send({ email });
  const ver = await request(app).post("/auth/verify-otp").send({ email, otp: gen.body.devOtp });
  return ver.body.proof;
}

async function signUp(role = "customer", overrides = {}) {
  const email = overrides.email || newEmail(role);
  const proof = await verifiedProof(email);
  const res = await request(app)
    .post("/auth/register")
    .send({ name: `Test ${role}`, email, password: "password123", role, proof, ...overrides });
  return { res, email, token: res.body.token, user: res.body.data };
}

async function makeAdmin() {
  const email = newEmail("admin");
  const user = await repos.users.create({ name: "Boss", email, password: await argon2.hash("adminpass1"), role: "admin" });
  const login = await request(app).post("/auth/login").send({ email, password: "adminpass1", role: "admin" });
  return { user, token: login.body.token, email };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const productBody = (o = {}) => ({ name: "Kurta", category: "Ethnic Wear", price: 999, count: 5, ...o });

describe("registration and OTP", () => {
  test("registers with a verified email and never returns the password hash", async () => {
    const { res } = await signUp("customer");
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.data.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/argon2/);
  });

  test("refuses to register without an email proof", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "No Proof", email: newEmail(), password: "password123", role: "customer" });
    expect(res.status).toBe(400);
  });

  test("a proof for one email cannot register another", async () => {
    const proof = await verifiedProof(newEmail("a"));
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Mallory", email: newEmail("b"), password: "password123", role: "customer", proof });
    expect(res.status).toBe(400);
  });

  test("rejects weak passwords, bad roles and admin self-registration", async () => {
    expect((await signUp("customer", { password: "short" })).res.status).toBe(400);
    expect((await signUp("customer", { role: "admin" })).res.status).toBe(400);
  });

  test("rejects duplicates for the same email and role", async () => {
    const first = await signUp("customer");
    const proof = await verifiedProof(first.email);
    const dup = await request(app)
      .post("/auth/register")
      .send({ name: "Again", email: first.email, password: "password123", role: "customer", proof });
    expect(dup.status).toBe(400);
  });

  test("a wrong OTP is rejected and five wrong guesses lock the code", async () => {
    const email = newEmail();
    const gen = await request(app).post("/auth/generate-otp").send({ email });
    const wrong = gen.body.devOtp === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post("/auth/verify-otp").send({ email, otp: wrong })).status).toBe(400);
    }
    const locked = await request(app).post("/auth/verify-otp").send({ email, otp: gen.body.devOtp });
    expect(locked.status).toBe(429);
  });

  test("OTP requests are throttled per email", async () => {
    const email = newEmail();
    expect((await request(app).post("/auth/generate-otp").send({ email })).status).toBe(200);
    expect((await request(app).post("/auth/generate-otp").send({ email })).status).toBe(429);
  });
});

describe("login and tokens", () => {
  test("logs in, returns a token that opens /auth/profile, and hides the hash", async () => {
    const { email } = await signUp("customer");
    const res = await request(app).post("/auth/login").send({ email, password: "password123", role: "customer" });
    expect(res.status).toBe(200);
    expect(res.body.data.password).toBeUndefined();
    const profile = await request(app).get("/auth/profile").set(auth(res.body.token));
    expect(profile.status).toBe(200);
    expect(profile.body.data.email).toBe(email);
  });

  test("wrong password and unknown email look identical", async () => {
    const { email } = await signUp("customer");
    const a = await request(app).post("/auth/login").send({ email, password: "wrong-password", role: "customer" });
    const b = await request(app).post("/auth/login").send({ email: newEmail("ghost"), password: "whatever1", role: "customer" });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.message).toBe(b.body.message);
  });

  test("logging in with the wrong role fails", async () => {
    const { email } = await signUp("customer");
    const res = await request(app).post("/auth/login").send({ email, password: "password123", role: "seller" });
    expect(res.status).toBe(401);
  });

  test("the removed /auth/generate-token endpoint no longer mints tokens", async () => {
    const { email } = await signUp("customer");
    const res = await request(app).post("/auth/generate-token").send({ email, userType: "customer" });
    expect(res.status).toBe(404);
  });

  test("rejects missing, garbage, wrong-secret and expired tokens", async () => {
    expect((await request(app).get("/auth/profile")).status).toBe(401);
    expect((await request(app).get("/auth/profile").set(auth("garbage"))).status).toBe(401);
    const forged = jwt.sign({ userId: 1, role: "admin" }, "some-other-secret");
    expect((await request(app).get("/auth/profile").set(auth(forged))).status).toBe(401);
    const expired = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: -10 });
    expect((await request(app).get("/auth/profile").set(auth(expired))).status).toBe(401);
  });

  test("a validly signed token cannot upgrade a customer to admin (role comes from the database)", async () => {
    const { user } = await signUp("customer");
    const sneaky = jwt.sign({ userId: user.id, role: "admin", email: user.email }, process.env.JWT_SECRET);
    expect((await request(app).get("/auth/users").set(auth(sneaky))).status).toBe(403);
  });

  test("an email-proof token is not accepted as a login token", async () => {
    const proof = await verifiedProof(newEmail());
    expect((await request(app).get("/auth/profile").set(auth(proof))).status).toBe(401);
  });
});

describe("admin features and bans", () => {
  test("only admins can list users, and the list has no password hashes", async () => {
    const customer = await signUp("customer");
    expect((await request(app).get("/auth/users").set(auth(customer.token))).status).toBe(403);
    expect((await request(app).get("/auth/users")).status).toBe(401);
    const admin = await makeAdmin();
    const list = await request(app).get("/auth/users").set(auth(admin.token));
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(list.body)).not.toMatch(/password/);
  });

  test("banning blocks login and kills the existing session; unbanning restores access", async () => {
    const admin = await makeAdmin();
    const victim = await signUp("customer");
    const ban = await request(app).post("/auth/ban-user").set(auth(admin.token)).send({ userId: victim.user.id, reason: "spam" });
    expect(ban.status).toBe(200);

    const login = await request(app).post("/auth/login").send({ email: victim.email, password: "password123", role: "customer" });
    expect(login.status).toBe(403);
    expect(login.body.reason).toBe("spam");
    expect((await request(app).get("/auth/profile").set(auth(victim.token))).status).toBe(403);

    expect((await request(app).post("/auth/unban-user").set(auth(admin.token)).send({ userId: victim.user.id })).status).toBe(200);
    expect((await request(app).get("/auth/profile").set(auth(victim.token))).status).toBe(200);
  });

  test("a timed ban expires on its own", async () => {
    const victim = await signUp("customer");
    await repos.bans.create({ userId: victim.user.id, email: victim.email, name: "x", reason: "r", bannedUntil: new Date(Date.now() - 1000) });
    const res = await request(app).post("/auth/login").send({ email: victim.email, password: "password123", role: "customer" });
    expect(res.status).toBe(200);
  });

  test("customers cannot ban, and admins cannot be banned", async () => {
    const admin = await makeAdmin();
    const a = await signUp("customer");
    const b = await signUp("customer");
    expect((await request(app).post("/auth/ban-user").set(auth(a.token)).send({ userId: b.user.id })).status).toBe(403);
    expect((await request(app).post("/auth/ban-user").set(auth(admin.token)).send({ userId: admin.user.id })).status).toBe(400);
  });

  test("admins can create other admins; others cannot", async () => {
    const admin = await makeAdmin();
    const body = { name: "Second", email: newEmail("adm"), password: "longenough1", adminId: admin.user.id };
    expect((await request(app).post("/auth/create-admin").set(auth(admin.token)).send(body)).status).toBe(201);
    const c = await signUp("customer");
    expect((await request(app).post("/auth/create-admin").set(auth(c.token)).send({ ...body, email: newEmail("adm") })).status).toBe(403);
  });

  test("profile pictures must be small images", async () => {
    const c = await signUp("customer");
    const ok = await request(app).post("/auth/update-profile").set(auth(c.token)).send({ profilePicture: "data:image/png;base64,AAAA" });
    expect(ok.status).toBe(200);
    const notImage = await request(app).post("/auth/update-profile").set(auth(c.token)).send({ profilePicture: "javascript:alert(1)" });
    expect(notImage.status).toBe(400);
  });
});

describe("products", () => {
  test("anyone can browse, but creating needs a seller or admin", async () => {
    expect((await request(app).get("/api/products")).status).toBe(200);
    expect((await request(app).post("/api/products/create").send(productBody())).status).toBe(401);
    const customer = await signUp("customer");
    expect((await request(app).post("/api/products/create").set(auth(customer.token)).send(productBody())).status).toBe(403);
  });

  test("a seller creates a product owned by themselves, ignoring a spoofed owner", async () => {
    const seller = await signUp("seller");
    const res = await request(app)
      .post("/api/products/create")
      .set(auth(seller.token))
      .send(productBody({ sellersEmail: "victim@example.com", sellersName: "Victim" }));
    expect(res.status).toBe(201);
    expect(res.body.product.sellersEmail).toBe(seller.email);
    const mine = await request(app).get(`/api/products/seller/${encodeURIComponent(seller.email)}`);
    expect(mine.body.products).toHaveLength(1);
  });

  test("sellers cannot edit or delete each other's products; admins can", async () => {
    const a = await signUp("seller");
    const b = await signUp("seller");
    const admin = await makeAdmin();
    const created = await request(app).post("/api/products/create").set(auth(a.token)).send(productBody());
    const id = created.body.product._id;

    expect((await request(app).put(`/api/products/${id}`).set(auth(b.token)).send({ price: 1 })).status).toBe(403);
    expect((await request(app).delete(`/api/products/${id}`).set(auth(b.token))).status).toBe(403);
    expect((await request(app).put(`/api/products/${id}`).set(auth(a.token)).send({ price: 1200 })).body.product.price).toBe(1200);
    expect((await request(app).delete(`/api/products/${id}`).set(auth(admin.token))).status).toBe(200);
    expect((await request(app).get(`/api/products/${id}`)).status).toBe(404);
  });

  test("validates price, stock, rating and image", async () => {
    const s = await signUp("seller");
    const post = (o) => request(app).post("/api/products/create").set(auth(s.token)).send(productBody(o));
    expect((await post({ price: -5 })).status).toBe(400);
    expect((await post({ price: "abc" })).status).toBe(400);
    expect((await post({ count: 1.5 })).status).toBe(400);
    expect((await post({ rating: 9 })).status).toBe(400);
    expect((await post({ name: "  " })).status).toBe(400);
    expect((await post({ image: "https://evil.example/x.png" })).status).toBe(400);
    expect((await post({ image: "data:image/png;base64," + "A".repeat(5 * 1024 * 1024 + 1) })).status).toBe(400);
  });

  test("category and rating filters work and return the products key", async () => {
    const s = await signUp("seller");
    await request(app).post("/api/products/create").set(auth(s.token)).send(productBody({ name: "A", category: "Shoes", rating: 4.5 }));
    await request(app).post("/api/products/create").set(auth(s.token)).send(productBody({ name: "B", category: "Hats", rating: 2 }));
    expect((await request(app).get("/api/products/category/shoes")).body.products.map((p) => p.name)).toEqual(["A"]);
    expect((await request(app).get("/api/products/rating/4")).body.products.map((p) => p.name)).toEqual(["A"]);
    expect((await request(app).get("/api/products/rating/abc")).status).toBe(400);
  });

  test("malformed JSON gets a clean 400", async () => {
    const res = await request(app).post("/auth/login").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });
});

describe("orders", () => {
  async function shop() {
    const seller = await signUp("seller");
    const other = await signUp("seller");
    const customer = await signUp("customer");
    const mk = async (who, o) =>
      (await request(app).post("/api/products/create").set(auth(who.token)).send(productBody(o))).body.product;
    const p1 = await mk(seller, { name: "Shirt", price: 500, count: 3 });
    const p2 = await mk(other, { name: "Hat", price: 200, count: 10 });
    return { seller, other, customer, p1, p2 };
  }

  test("placing an order reduces stock and shows up in the buyer's history", async () => {
    const { customer, p1 } = await shop();
    const res = await request(app).post("/api/orders").set(auth(customer.token)).send({ items: [{ productId: p1._id, qty: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.order.total).toBe(1000);
    expect((await request(app).get(`/api/products/${p1._id}`)).body.product.count).toBe(1);
    const mine = await request(app).get("/api/orders/mine").set(auth(customer.token));
    expect(mine.body.orders).toHaveLength(1);
  });

  test("cannot oversell, and a failed multi-item order leaves every stock level untouched", async () => {
    const { customer, p1, p2 } = await shop();
    const res = await request(app)
      .post("/api/orders")
      .set(auth(customer.token))
      .send({ items: [{ productId: p2._id, qty: 4 }, { productId: p1._id, qty: 5 }] });
    expect(res.status).toBe(409);
    expect((await request(app).get(`/api/products/${p2._id}`)).body.product.count).toBe(10);
    expect((await request(app).get(`/api/products/${p1._id}`)).body.product.count).toBe(3);
  });

  test("duplicate lines are merged before the stock check", async () => {
    const { customer, p1 } = await shop();
    const res = await request(app)
      .post("/api/orders")
      .set(auth(customer.token))
      .send({ items: [{ productId: p1._id, qty: 2 }, { productId: p1._id, qty: 2 }] });
    expect(res.status).toBe(409);
  });

  test("rejects empty carts, bad quantities and non-customers", async () => {
    const { customer, seller, p1 } = await shop();
    const post = (token, items) => request(app).post("/api/orders").set(auth(token)).send({ items });
    expect((await post(customer.token, [])).status).toBe(400);
    expect((await post(customer.token, [{ productId: p1._id, qty: 0 }])).status).toBe(400);
    expect((await post(customer.token, [{ productId: p1._id, qty: -1 }])).status).toBe(400);
    expect((await post(customer.token, [{ productId: "nope", qty: 1 }])).status).toBe(404);
    expect((await post(seller.token, [{ productId: p1._id, qty: 1 }])).status).toBe(403);
    expect((await request(app).post("/api/orders").send({ items: [] })).status).toBe(401);
  });

  test("a seller sees only their own lines and never the buyer's identity", async () => {
    const { customer, seller, other, p1, p2 } = await shop();
    await request(app)
      .post("/api/orders")
      .set(auth(customer.token))
      .send({ items: [{ productId: p1._id, qty: 1 }, { productId: p2._id, qty: 2 }] });
    const res = await request(app).get("/api/orders/seller").set(auth(seller.token));
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].items.map((i) => i.name)).toEqual(["Shirt"]);
    expect(res.body.orders[0].total).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain(customer.email);
    const theirs = await request(app).get("/api/orders/seller").set(auth(other.token));
    expect(theirs.body.orders[0].items.map((i) => i.name)).toEqual(["Hat"]);
    expect((await request(app).get("/api/orders/seller").set(auth(customer.token))).status).toBe(403);
  });
});

describe("hardening", () => {
  test("sends security headers and hides the framework", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("CORS only echoes allowed origins", async () => {
    const ok = await request(app).get("/health").set("Origin", "http://localhost:3000");
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    const bad = await request(app).get("/health").set("Origin", "https://evil.example");
    expect(bad.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("unknown routes return JSON 404", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
