import express from "express";
import {
  createShippingZone,
  getShippingZones,
  getShippingRate,
  updateShippingZone,
} from "../controllers/shipping.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Public routes
router.get("/rate", getShippingRate);
router.get("/", getShippingZones);

// Admin routes
router.post("/", ensureAuthenticated, authorize(["admin"]), createShippingZone);
router.put(
  "/:id",
  ensureAuthenticated,
  authorize(["admin"]),
  updateShippingZone
);

export default router;
