import express from "express";
import { getFinancialMetrics } from "../controllers/analytics.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Routes
router.get(
  "/financial",
  ensureAuthenticated,
  authorize(["admin"]),
  getFinancialMetrics
);

export default router;
