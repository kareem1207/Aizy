import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    sellersEmail: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    userEmail: { type: String, required: true },
    status: { type: String, default: "Placed (no payment taken)" },
    items: { type: [itemSchema], required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
