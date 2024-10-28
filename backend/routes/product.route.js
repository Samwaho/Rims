import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
} from "../controllers/product.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Product routes
router
  .route("/")
  .get(getProducts)
  .post(ensureAuthenticated, authorize(["admin"]), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(ensureAuthenticated, authorize(["admin"]), updateProduct)
  .delete(ensureAuthenticated, authorize(["admin"]), deleteProduct);

// Review routes
router
  .route("/:id/reviews")
  .get(getProductReviews)
  .post(ensureAuthenticated, addReview);

router
  .route("/:productId/reviews/:reviewId")
  .put(ensureAuthenticated, updateReview)
  .delete(ensureAuthenticated, deleteReview);

export default router;
