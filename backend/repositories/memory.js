// In-memory repositories. Same interface as repositories/db.js, so the API
// behaves identically without MongoDB or MySQL.
import crypto from "node:crypto";

const clone = (o) => (o ? structuredClone(o) : o);
const newId = () => crypto.randomBytes(12).toString("hex");

export function createMemoryRepos() {
  let userSeq = 1;
  let banSeq = 1;
  let orderSeq = 1;
  const users = [];
  const bans = [];
  const products = [];
  const orders = [];

  return {
    kind: "memory",

    users: {
      async findById(id) {
        return clone(users.find((u) => u.id === id));
      },
      async findByEmail(email) {
        return clone(users.filter((u) => u.email === email));
      },
      async findByEmailRole(email, role) {
        return clone(users.find((u) => u.email === email && u.role === role));
      },
      async create({ name, email, password, role }) {
        const now = new Date();
        const user = { id: userSeq++, name, email, password, role, profilePicture: null, createdAt: now, updatedAt: now };
        users.push(user);
        return clone(user);
      },
      async list() {
        return users.map(({ id, name, email, role }) => ({ id, name, email, role }));
      },
      async update(id, patch) {
        const u = users.find((x) => x.id === id);
        if (!u) return null;
        Object.assign(u, patch, { updatedAt: new Date() });
        return clone(u);
      },
    },

    bans: {
      async findByUserId(userId) {
        return clone(bans.find((b) => b.userId === userId));
      },
      async create({ userId, email, name, reason, bannedUntil }) {
        const ban = { id: banSeq++, userId, email, name, reason, bannedUntil, createdAt: new Date() };
        bans.push(ban);
        return clone(ban);
      },
      async deleteByUserId(userId) {
        const i = bans.findIndex((b) => b.userId === userId);
        if (i >= 0) bans.splice(i, 1);
        return i >= 0;
      },
      async list() {
        return clone(bans);
      },
    },

    products: {
      async list() {
        return clone(products);
      },
      async getById(id) {
        return clone(products.find((p) => p._id === id));
      },
      async create(data) {
        const now = new Date().toISOString();
        const p = { _id: newId(), rating: 0, ...data, createdAt: now, updatedAt: now };
        products.unshift(p);
        return clone(p);
      },
      async update(id, patch) {
        const p = products.find((x) => x._id === id);
        if (!p) return null;
        Object.assign(p, patch, { updatedAt: new Date().toISOString() });
        return clone(p);
      },
      async delete(id) {
        const i = products.findIndex((p) => p._id === id);
        if (i >= 0) products.splice(i, 1);
        return i >= 0;
      },
      async byCategory(category) {
        return clone(products.filter((p) => p.category.toLowerCase() === category.toLowerCase()));
      },
      async byMinRating(min) {
        return clone(products.filter((p) => p.rating >= min));
      },
      async bySeller(email) {
        return clone(products.filter((p) => p.sellersEmail.toLowerCase() === email.toLowerCase()));
      },
    },

    orders: {
      // Reserves stock for every line, or fails without changing anything.
      async place({ userId, userEmail, lines }) {
        for (const { productId, qty } of lines) {
          const p = products.find((x) => x._id === productId);
          if (!p) return { error: "not_found", productId };
          if (p.count < qty) return { error: "insufficient", name: p.name, available: p.count };
        }
        const items = lines.map(({ productId, qty }) => {
          const p = products.find((x) => x._id === productId);
          p.count -= qty;
          return { productId, name: p.name, qty, price: p.price, sellersEmail: p.sellersEmail };
        });
        const order = {
          id: `AZ-${String(orderSeq++).padStart(5, "0")}`,
          userId,
          userEmail,
          date: new Date().toISOString(),
          status: "Placed (no payment taken)",
          items,
          total: items.reduce((a, i) => a + i.qty * i.price, 0),
        };
        orders.unshift(order);
        return { order: clone(order) };
      },
      async byUser(userId) {
        return clone(orders.filter((o) => o.userId === userId));
      },
      async bySeller(email) {
        return clone(orders.filter((o) => o.items.some((i) => i.sellersEmail === email)));
      },
      async all() {
        return clone(orders);
      },
    },
  };
}
