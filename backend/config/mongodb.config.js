import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (!env.mongoUrl) throw new Error("MONGO_URL is not set (or run with DATA_MODE=memory)");
  await mongoose.connect(env.mongoUrl);
  console.log("Connected to MongoDB");
};
