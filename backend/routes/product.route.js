import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { ensureAuthenticated, authorize } from "../middleware/middleware.js";

const router = express.Router();

// Define routes for products
router
  .route("/")
  .get(getProducts)
  .post(ensureAuthenticated, authorize(["admin"]), createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(ensureAuthenticated, authorize(["admin"]), updateProduct)
  .delete(ensureAuthenticated, authorize(["admin"]), deleteProduct);

export default router;
