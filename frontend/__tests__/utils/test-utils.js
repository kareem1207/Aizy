import { makeDemoToken, TOKEN_KEY } from "@/lib/token";

/** Signs a demo-format session token for a role and stores it like the app does. */
export const signIn = (role = "customer", extra = {}) => {
  const token = makeDemoToken({
    userId: 1,
    username: `Test ${role}`,
    email: `${role}@example.com`,
    role,
    ...extra,
  });
  window.localStorage.setItem(TOKEN_KEY, token);
  return token;
};

export const sampleProduct = (over = {}) => ({
  _id: "p1",
  name: "Cotton Kurta Set",
  category: "Ethnic Wear",
  price: 1799,
  count: 10,
  rating: 4.5,
  shortDescription: "Breathable kurta set",
  description: "A longer description",
  image: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
  sellersName: "Aizy Official",
  sellersEmail: "seller@aizy.demo",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});
