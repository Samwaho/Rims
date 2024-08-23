import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3001;
const mongodb_uri = process.env.MONGODB_URI;

mongoose
  .connect(mongodb_uri)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

app.use(express.json());
app.listen(port, () => {
  console.log("Server running on port ", port);
});

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, statusCode, message });
});
