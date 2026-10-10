import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

/** Builds the Express app around a repositories object (memory or db). */
export function createApp(repos) {
  const app = express();
  app.locals.repos = repos;
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin and non-browser clients send no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  // Product images travel as base64 data URLs, hence the higher limit.
  app.use(express.json({ limit: "8mb" }));

  app.get("/", (req, res) => res.json({ message: "API is working!", mode: repos.kind }));
  app.get("/health", (req, res) => res.json({ status: "ok", mode: repos.kind }));

  app.use("/auth", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);

  app.use((req, res) => res.status(404).json({ success: false, message: "Resource not found!" }));

  app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") return res.status(413).json({ success: false, message: "Request body too large" });
    if (err.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Invalid JSON" });
    console.error("Server error:", err.message);
    res.status(err.status || 500).json({ success: false, message: env.isProd ? "Internal server error" : err.message });
  });

  return app;
}
