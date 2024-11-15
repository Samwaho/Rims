import express from "express";
import {
  createDiscount,
  validateDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discount.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Public route
router.post("/validate", validateDiscount);

// Admin routes
router.get("/", ensureAuthenticated, authorize(["admin"]), getAllDiscounts);
router.post("/", ensureAuthenticated, authorize(["admin"]), createDiscount);
router.put("/:id", ensureAuthenticated, authorize(["admin"]), updateDiscount);
router.delete(
  "/:id",
  ensureAuthenticated,
  authorize(["admin"]),
  deleteDiscount
);

export default router;
