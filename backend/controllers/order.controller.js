const fail = (res, status, message) => res.status(status).json({ success: false, message });

// No payment is taken anywhere in Aizy: an order records the purchase and reserves stock.
export const placeOrder = async (req, res) => {
  try {
    if (req.user.role !== "customer") return fail(res, 403, "Only customers can place orders");
    const wanted = Array.isArray(req.body.items) ? req.body.items : [];
    if (!wanted.length) return fail(res, 400, "Your cart is empty");
    if (wanted.length > 50) return fail(res, 400, "Too many items in one order");

    // Merge duplicate lines so stock checks see the true quantity.
    const merged = new Map();
    for (const w of wanted) {
      const qty = Number(w.qty);
      if (typeof w.productId !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 20)
        return fail(res, 400, "Invalid item or quantity");
      merged.set(w.productId, (merged.get(w.productId) || 0) + qty);
    }
    const lines = [...merged].map(([productId, qty]) => ({ productId, qty }));

    const result = await req.app.locals.repos.orders.place({ userId: req.user.userId, userEmail: req.user.email, lines });
    if (result.error === "not_found") return fail(res, 404, "A product in your cart no longer exists");
    if (result.error === "insufficient") return fail(res, 409, `Only ${result.available} left of ${result.name}`);
    return res.status(201).json({ success: true, message: "Order placed", order: result.order });
  } catch (error) {
    console.error("Error placing order:", error.message);
    return fail(res, 500, "Internal server error");
  }
};

export const myOrders = async (req, res) => {
  try {
    res.status(200).json({ success: true, orders: await req.app.locals.repos.orders.byUser(req.user.userId) });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    fail(res, 500, "Internal server error");
  }
};

export const sellerOrders = async (req, res) => {
  try {
    const { orders } = req.app.locals.repos;
    if (req.user.role === "admin") return res.status(200).json({ success: true, orders: await orders.all() });
    // Sellers only see their own lines, without the buyer's identity.
    const mine = (await orders.bySeller(req.user.email)).map(({ userId, userEmail, ...o }) => {
      const items = o.items.filter((i) => i.sellersEmail === req.user.email);
      return { ...o, items, total: items.reduce((a, i) => a + i.qty * i.price, 0) };
    });
    res.status(200).json({ success: true, orders: mine });
  } catch (error) {
    console.error("Error fetching seller orders:", error.message);
    fail(res, 500, "Internal server error");
  }
};
