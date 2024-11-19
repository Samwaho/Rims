import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./config/passport.config.js";

// Route imports
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import discountRoute from "./routes/discount.route.js";
import shippingRoute from "./routes/shipping.route.js";
import taxRoute from "./routes/tax.route.js";
import userRouter from "./routes/user.route.js";
import analyticsRoute from "./routes/analytics.route.js";

// Load environment variables
dotenv.config();

// Constants
const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Add this after dotenv.config()
console.log("Google OAuth credentials loaded:", {
  clientId: process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Present" : "Missing",
});

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
    origin: "*",
    credentials: true,
  })
);
app.use(passport.initialize());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/discounts", discountRoute);
app.use("/api/shipping", shippingRoute);
app.use("/api/tax", taxRoute);
app.use("/api/analytics", analyticsRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  res.status(404).json({
    success: false,
    message: "Route not found",
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
