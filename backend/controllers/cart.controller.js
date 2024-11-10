import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { errorHandler } from "../utils/error.js";

const validateUser = (req) => {
  if (!req.user?.id) {
    throw { status: 401, message: "Unauthorized" };
  }
  return req.user.id;
};

const validateQuantity = (quantity, minValue = 1) => {
  if (typeof quantity !== "number" || quantity < minValue) {
    throw { status: 400, message: "Invalid quantity" };
  }
};

const checkProductStock = (product, requestedQuantity) => {
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }
  if (product.stock < requestedQuantity) {
    throw { status: 400, message: "Insufficient stock available" };
  }
};

export const getCart = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    res.json(cart?.items || []); // Return empty array for new users
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { productId, quantity } = req.body;

    if (!productId) {
      throw { status: 400, message: "Product ID is required" };
    }
    validateQuantity(quantity);

    const product = await Product.findById(productId);
    checkProductStock(product, quantity);

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {},
      { upsert: true, new: true }
    );

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      checkProductStock(product, newQuantity);
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: "Item added to cart" });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId) {
      throw { status: 400, message: "Item ID is required" };
    }
    validateQuantity(quantity, 0);

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw { status: 404, message: "Cart not found" };
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw { status: 404, message: "Item not found in cart" };
    }

    const product = await Product.findById(item.product);
    checkProductStock(product, quantity);

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ message: "Cart item updated" });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { itemId } = req.params;

    if (!itemId) {
      throw { status: 400, message: "Item ID is required" };
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      throw { status: 404, message: "Cart or item not found" };
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getCartCount = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const cart = await Cart.findOne({ user: userId });
    const count =
      cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    res.json({ count });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};
