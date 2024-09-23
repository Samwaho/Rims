import express from "express";
import {
  getCart,
  getCartCount,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { ensureAuthenticated } from "../middleware/middleware.js";

const router = express.Router();

router.use(ensureAuthenticated);

router.get("/", getCart);
router.get("/count", getCartCount);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);

export default router;
