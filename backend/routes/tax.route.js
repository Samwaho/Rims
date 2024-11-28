import express from "express";
import {
  createTaxConfig,
  getTaxConfigs,
  updateTaxConfig,
  deleteTaxConfig,
} from "../controllers/tax.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Public route for getting tax configs
router.get("/", getTaxConfigs);

// Admin routes
router.post("/", ensureAuthenticated, authorize(["admin"]), createTaxConfig);
router.put("/:id", ensureAuthenticated, authorize(["admin"]), updateTaxConfig);
router.delete("/:id", deleteTaxConfig);

export default router;
