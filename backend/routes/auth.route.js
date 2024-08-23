import express from "express";
import {
  getAuthUser,
  logoutController,
  refreshToken,
  signInController,
  signUpController,
} from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middleware/middleware.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.get("/auth-user", ensureAuthenticated, getAuthUser);
router.get("/refreshToken", refreshToken);
router.get("/logout", logoutController);

export default router;
