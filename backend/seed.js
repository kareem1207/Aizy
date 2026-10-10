import argon2 from "argon2";
import { env } from "./config/env.js";

const DEMO_PASSWORD = "demo1234";

/** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD (a fresh database has no admins). */
export async function seedAdmin(repos) {
  if (!env.adminEmail || !env.adminPassword) return false;
  const email = env.adminEmail.toLowerCase();
  if (await repos.users.findByEmailRole(email, "admin")) return false;
  if (env.adminPassword.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  await repos.users.create({ name: "Admin", email, password: await argon2.hash(env.adminPassword), role: "admin" });
  console.log(`Seeded admin account ${email}`);
  return true;
}

/** Demo accounts and a few products, for SEED_DEMO=1 in memory mode. Never use in production. */
export async function seedDemo(repos) {
  const password = await argon2.hash(DEMO_PASSWORD);
  const mk = (name, email, role) => repos.users.create({ name, email, password, role });
  await mk("Demo Customer", "customer@aizy.demo", "customer");
  const seller = await mk("Aizy Official", "seller@aizy.demo", "seller");
  await mk("Demo Admin", "admin@aizy.demo", "admin");
  const items = [
    ["Cotton Kurta Set", "Ethnic Wear", 1799, 30, 4.5],
    ["Running Shoes", "Footwear", 3299, 25, 4.6],
    ["Wireless Earbuds", "Electronics", 2499, 40, 4.3],
    ["Hardbound Notebook", "Stationery", 249, 90, 4.5],
  ];
  for (const [name, category, price, count, rating] of items) {
    await repos.products.create({
      name,
      category,
      price,
      count,
      rating,
      shortDescription: name,
      description: name,
      image: "",
      imageType: "image/jpeg",
      sellersName: seller.name,
      sellersEmail: seller.email,
    });
  }
}
