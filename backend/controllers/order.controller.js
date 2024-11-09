import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { sendOrderConfirmationEmail } from "../utils/sendVerificationEmail.js";

// Create a new order from cart
export const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity, paymentMethod, paymentDetails, totalAmount } =
      req.body;

    // Ensure we have a user
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let orderProducts = [];
    let calculatedTotal = 0;

    if (productId) {
      // Handle direct product purchase
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < (quantity || 1)) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      calculatedTotal = product.price * (quantity || 1);
      orderProducts = [
        {
          product: product._id,
          quantity: quantity || 1,
        },
      ];

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -(quantity || 1) },
      });
    } else {
      // Handle cart purchase
      const cart = await Cart.findOne({ user: req.user.id }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Process cart items
      for (const item of cart.items) {
        const product = item.product;

        if (!product) {
          return res
            .status(400)
            .json({ message: "One or more products no longer exist" });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}`,
          });
        }

        calculatedTotal += product.price * item.quantity;
        orderProducts.push({
          product: product._id,
          quantity: item.quantity,
        });

        // Update product stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear the cart after successful order creation
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } }
      );
    }

    // Create the order with payment information
    const order = await Order.create({
      user: req.user.id,
      products: orderProducts,
      totalAmount: calculatedTotal,
      status: "pending",
      paymentMethod,
      paymentDetails,
      paymentStatus: "pending",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    // Send order confirmation email
    await sendOrderConfirmationEmail(populatedOrder.user.email, populatedOrder);

    // If using Mpesa, initiate payment here
    if (paymentMethod === "mpesa") {
      // Add your Mpesa payment integration logic here
      // You might want to call a separate service/function
    }

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("user", "username email")
      .populate("products.product", "name price images")
      .sort("-orderDate");

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the requesting user
    if (order.user._id.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to access this order" });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If order is being cancelled, restore the product stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      note: note || "",
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow order owner to cancel
    if (order.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this order" });
    }

    // Only allow cancellation of pending or processing orders
    if (!["pending", "processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel order in current status" });
    }

    // Restore product stock when cancelling order
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("products.product", "name price images")
      .sort("-orderDate")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update shipping information (admin only)
export const updateShippingInfo = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.shippingInfo = {
      ...order.shippingInfo,
      trackingNumber,
      carrier,
      estimatedDelivery: new Date(estimatedDelivery),
      updatedAt: new Date(),
    };

    if (trackingNumber && !order.status.includes("shipped")) {
      order.status = "shipped";
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    res.status(200).json({
      message: "Shipping information updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
