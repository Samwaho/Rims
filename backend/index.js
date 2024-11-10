import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// Route imports
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";

// Load environment variables
dotenv.config();

// Constants
const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ Error: ${message}`);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start server
const startServer = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
