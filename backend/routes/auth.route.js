import express from "express";
import {
  forgotPasswordController,
  getAuthUser,
  logoutController,
  refreshToken,
  resetPasswordController,
  signInController,
  signUpController,
  googleAuthCallback,
} from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middleware/middleware.js";
import passport from "passport";

const router = express.Router();

// Authentication routes
router.post("/signup", signUpController);
router.post("/signin", signInController);
router.get("/user", ensureAuthenticated, getAuthUser);
router.get("/refresh-token", refreshToken);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthCallback
);

export default router;
