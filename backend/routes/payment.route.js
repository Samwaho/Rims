import express from "express";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";
import {
  initiatePesapalPayment,
  handlePesapalIPN,
} from "../controllers/pesapal.controller.js";

const router = express.Router();

// Protected route - requires authentication
router.post("/pesapal/initiate", ensureAuthenticated, initiatePesapalPayment);

// Public route - for Pesapal IPN callbacks
router.post("/pesapal/ipn", handlePesapalIPN);

export default router;
