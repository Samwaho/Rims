import express from "express";
import {
  getWheels,
  getWheelById,
  createWheel,
  updateWheel,
  deleteWheel,
} from "../controllers/wheel.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Define routes for wheels
router
  .route("/")
  .get(getWheels)
  .post(ensureAuthenticated, authorize(["admin"]), createWheel);
router
  .route("/:id")
  .get(getWheelById)
  .put(ensureAuthenticated, authorize(["admin"]), updateWheel)
  .delete(ensureAuthenticated, authorize(["admin"]), deleteWheel);

export default router;
