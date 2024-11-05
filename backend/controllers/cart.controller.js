import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.json([]); // Return empty array instead of 404 for new users
    }
    res.json(cart.items);
  } catch (error) {
    next(new Error("Failed to fetch cart: " + error.message));
  }
};

export const addToCart = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Invalid product ID or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        return res
          .status(400)
          .json({ message: "Insufficient stock available" });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: "Item added to cart" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(new Error("Failed to add item to cart: " + error.message));
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ message: "Invalid item ID or quantity" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "Product no longer exists" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ message: "Cart item updated" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    next(new Error("Failed to update cart item: " + error.message));
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === itemId
    );
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    next(new Error("Failed to remove item from cart: " + error.message));
  }
};

export const getCartCount = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart
      ? cart.items.reduce((total, item) => total + item.quantity, 0)
      : 0;
    res.json({ count });
  } catch (error) {
    next(new Error("Failed to get cart count: " + error.message));
  }
};
