import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  updateShippingInfo,
  updateOrderCosts,
  deleteOrder,
  getNewOrdersCount,
  markOrdersAsViewed,
} from "../controllers/order.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

router.use(ensureAuthenticated);

router.post("/", createOrder);
router.get("/user-orders", getUserOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

router.get("/admin/all", authorize(["admin"]), getAllOrders);
router.patch("/:orderId/status", authorize(["admin"]), updateOrderStatus);
router.patch("/:orderId/shipping", authorize(["admin"]), updateShippingInfo);
router.patch("/:orderId/costs", authorize(["admin"]), updateOrderCosts);

router.delete("/:orderId", authorize(["admin"]), deleteOrder);

router.get(
  "/new/count",
  ensureAuthenticated,
  authorize(["admin"]),
  getNewOrdersCount
);

router.post("/mark-viewed", authorize(["admin"]), markOrdersAsViewed);

export default router;
