import express from "express";
import {
  authorize,
  ensureAuthenticated,
  getAuthUser,
  signInController,
  signUpController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.get("/auth-user", ensureAuthenticated, getAuthUser);

export default router;
