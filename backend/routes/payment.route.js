import express from "express";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";
import {
  initiatePesapalPayment,
  handlePesapalIPN,
  getPesapalTransactionStatus,
} from "../controllers/pesapal.controller.js";

const router = express.Router();

// Protected route - requires authentication
router.post("/pesapal/initiate", ensureAuthenticated, initiatePesapalPayment);

// Public route - for Pesapal IPN callbacks
router.post("/pesapal/ipn", handlePesapalIPN);

// Admin route - for checking payment status
router.get(
  "/pesapal/status/:trackingId",
  ensureAuthenticated,
  authorize(["admin"]),
  getPesapalTransactionStatus
);

export default router;
