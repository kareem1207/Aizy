import express from "express";
import path from "path";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(express.json()); //* allows json for req.body

app.use(express.urlencoded({ extended: true })); //* allows form data for req.body
app.use("/auth", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
