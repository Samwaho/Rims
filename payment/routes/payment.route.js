import express from "express";
import { getAccessToken } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/get-access-token", getAccessToken);

export default router;
