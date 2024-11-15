import express from "express";
import {
  createTaxConfig,
  getTaxConfigs,
  updateTaxConfig,
} from "../controllers/tax.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Public route for getting tax configs
router.get("/", getTaxConfigs);

// Admin routes
router.post("/", ensureAuthenticated, authorize(["admin"]), createTaxConfig);
router.put("/:id", ensureAuthenticated, authorize(["admin"]), updateTaxConfig);

export default router;
