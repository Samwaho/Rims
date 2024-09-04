import express from "express";
import {
  forgotPasswordController,
  getAuthUser,
  logoutController,
  refreshToken,
  resetPasswordController,
  signInController,
  signUpController,
} from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middleware/middleware.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signUpController);
router.post("/signin", signInController);
router.get("/user", ensureAuthenticated, getAuthUser);
router.get("/refresh-token", refreshToken);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);
export default router;
