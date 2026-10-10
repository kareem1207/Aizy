// MongoDB (products, orders) + MySQL via Prisma (users, bans) repositories.
// Same interface as repositories/memory.js.
import crypto from "node:crypto";
import mongoose from "mongoose";
import Product from "../database/mongodb/mongoSchema.js";
import Order from "../database/mongodb/orderSchema.js";

const plain = (doc) => {
  if (!doc) return doc;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o._id = String(o._id);
  delete o.__v;
  return o;
};
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function createDbRepos() {
  const { prisma } = await import("../config/prisma.config.js");

  const orderView = (o) => ({
    id: o.orderNo,
    userId: o.userId,
    userEmail: o.userEmail,
    date: o.createdAt.toISOString(),
    status: o.status,
    items: o.items.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price, sellersEmail: i.sellersEmail })),
    total: o.total,
  });

  return {
    kind: "db",

    users: {
      findById: (id) => prisma.user.findUnique({ where: { id } }),
      findByEmail: (email) => prisma.user.findMany({ where: { email } }),
      findByEmailRole: (email, role) => prisma.user.findFirst({ where: { email, role } }),
      create: ({ name, email, password, role }) => prisma.user.create({ data: { name, email, password, role } }),
      list: () => prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }),
      update: (id, patch) => prisma.user.update({ where: { id }, data: patch }).catch(() => null),
    },

    bans: {
      findByUserId: (userId) => prisma.bannedUser.findUnique({ where: { userId } }),
      create: (data) => prisma.bannedUser.create({ data }),
      deleteByUserId: async (userId) => (await prisma.bannedUser.deleteMany({ where: { userId } })).count > 0,
      list: () => prisma.bannedUser.findMany(),
    },

    products: {
      list: async () => (await Product.find().sort({ createdAt: -1 })).map(plain),
      getById: async (id) => (validId(id) ? plain(await Product.findById(id)) : null),
      create: async (data) => plain(await Product.create(data)),
      update: async (id, patch) => (validId(id) ? plain(await Product.findByIdAndUpdate(id, patch, { new: true })) : null),
      delete: async (id) => (validId(id) ? Boolean(await Product.findByIdAndDelete(id)) : false),
      byCategory: async (category) =>
        (await Product.find({ category: new RegExp(`^${escapeRe(category)}$`, "i") }).sort({ createdAt: -1 })).map(plain),
      byMinRating: async (min) => (await Product.find({ rating: { $gte: min } }).sort({ createdAt: -1 })).map(plain),
      bySeller: async (email) =>
        (await Product.find({ sellersEmail: new RegExp(`^${escapeRe(email)}$`, "i") }).sort({ createdAt: -1 })).map(plain),
    },

    orders: {
      // Each line is reserved with an atomic conditional decrement; on any failure earlier lines are put back.
      async place({ userId, userEmail, lines }) {
        const reserved = [];
        const rollback = () => Promise.all(reserved.map((r) => Product.updateOne({ _id: r.productId }, { $inc: { count: r.qty } })));
        const items = [];
        for (const { productId, qty } of lines) {
          if (!validId(productId)) {
            await rollback();
            return { error: "not_found", productId };
          }
          const p = await Product.findOneAndUpdate({ _id: productId, count: { $gte: qty } }, { $inc: { count: -qty } }, { new: true });
          if (!p) {
            await rollback();
            const exists = await Product.findById(productId);
            return exists ? { error: "insufficient", name: exists.name, available: exists.count } : { error: "not_found", productId };
          }
          reserved.push({ productId, qty });
          items.push({ productId, name: p.name, qty, price: p.price, sellersEmail: p.sellersEmail });
        }
        const orderNo = `AZ-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
        const total = items.reduce((a, i) => a + i.qty * i.price, 0);
        try {
          return { order: orderView(await Order.create({ orderNo, userId, userEmail, items, total })) };
        } catch (err) {
          await rollback();
          throw err;
        }
      },
      byUser: async (userId) => (await Order.find({ userId }).sort({ createdAt: -1 })).map(orderView),
      bySeller: async (email) => (await Order.find({ "items.sellersEmail": email }).sort({ createdAt: -1 })).map(orderView),
      all: async () => (await Order.find().sort({ createdAt: -1 })).map(orderView),
    },
  };
}
