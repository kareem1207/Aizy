import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import { connectDB } from "./config/mongodb.config.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// CORS middleware needs to come BEFORE routes
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", userRoutes);

app.use("/products", productRoutes);
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    message: "Something broke on the server!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
