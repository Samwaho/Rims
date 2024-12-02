import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  updatePaymentMethods,
  updatePreferences,
  updateAddress,
  getAllUsers,
  updateUserRole,
} from "../controllers/user.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(ensureAuthenticated);

// User profile routes
router
  .route("/profile")
  .get(getUserProfile)
  .patch(updateUserProfile)
  .delete(deleteUser);

// Wishlist routes
router
  .route("/wishlist/:productId")
  .post(addToWishlist)
  .delete(removeFromWishlist);

// User settings routes
router.route("/payment-methods").patch(updatePaymentMethods);

router.route("/preferences").patch(updatePreferences);

router.route("/address").patch(updateAddress);

// Admin routes
router.route("/all").get(authorize(["admin"]), getAllUsers);

router.patch("/:userId/role", authorize(["admin"]), updateUserRole);

export default router;
