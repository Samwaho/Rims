import express from "express";
import { processPayment } from "../controllers/payment.controller.js";
import { ensureAuthenticated } from "../middleware/middleware.js";

const router = express.Router();

router.use(ensureAuthenticated);

router.post("/", processPayment);

export default router;
