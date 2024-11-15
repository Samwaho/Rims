import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { sendOrderConfirmationEmail } from "../utils/sendVerificationEmail.js";
import { errorHandler } from "../utils/error.js";
import Discount from "../models/discount.model.js";
import ShippingZone from "../models/shipping.model.js";
import TaxConfig from "../models/tax.model.js";
import { calculateShippingCost } from "../controllers/shipping.controller.js";
import { validateDiscountCode } from "../controllers/discount.controller.js";
import { getTaxRate } from "../controllers/tax.controller.js";

const validateUser = (req) => {
  if (!req.user?.id) {
    throw { status: 401, message: "User not authenticated" };
  }
  return req.user.id;
};

const validateProduct = async (product, quantity) => {
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }
  if (product.stock < quantity) {
    throw {
      status: 400,
      message: `Insufficient stock for product: ${product.name}`,
    };
  }
};

const updateProductStock = async (productId, quantity) => {
  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: -quantity },
  });
};

const calculateOrderTotals = async (
  subtotal,
  deliveryPointId,
  discountCode = null
) => {
  const { discount } = await validateDiscountCode({
    code: discountCode,
    subtotal,
  });
  const shippingCost = await calculateShippingCost({
    deliveryPointId,
    subtotal,
  });
  const taxRate = await getTaxRate();

  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;

  const total = subtotal - discount + tax + shippingCost;

  return {
    subtotal,
    discount,
    taxRate,
    tax,
    shippingCost,
    total,
  };
};

const processDirectPurchase = async (
  productId,
  quantity = 1,
  deliveryPointId,
  discountCode = null
) => {
  const product = await Product.findById(productId);
  await validateProduct(product, quantity);

  const orderProduct = {
    product: product._id,
    quantity,
  };

  await updateProductStock(product._id, quantity);

  const subtotal = product.price * quantity;
  return {
    orderProducts: [orderProduct],
    ...(await calculateOrderTotals(subtotal, deliveryPointId, discountCode)),
  };
};

const processCartPurchase = async (
  userId,
  deliveryPointId,
  discountCode = null
) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart?.items?.length) {
    throw { status: 400, message: "Cart is empty" };
  }

  let subtotal = 0;
  const orderProducts = [];

  for (const item of cart.items) {
    const { product, quantity } = item;
    await validateProduct(product, quantity);

    subtotal += product.price * quantity;
    orderProducts.push({ product: product._id, quantity });
    await updateProductStock(product._id, quantity);
  }

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  return {
    orderProducts,
    ...(await calculateOrderTotals(subtotal, deliveryPointId, discountCode)),
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const {
      productId,
      quantity,
      paymentMethod,
      paymentDetails,
      discountCode,
      deliveryPointId,
    } = req.body;

    if (!deliveryPointId) {
      throw { status: 400, message: "Delivery point is required" };
    }

    const orderData = productId
      ? await processDirectPurchase(
          productId,
          quantity,
          deliveryPointId,
          discountCode
        )
      : await processCartPurchase(userId, deliveryPointId, discountCode);

    const deliveryPoint = await ShippingZone.findById(deliveryPointId);
    if (!deliveryPoint) {
      throw { status: 400, message: "Invalid delivery point" };
    }

    const order = await Order.create({
      user: userId,
      products: orderData.orderProducts,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      discountCode,
      tax: orderData.tax,
      taxRate: orderData.taxRate,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      status: "pending",
      paymentMethod,
      paymentDetails,
      paymentStatus: "pending",
      deliveryPoint: {
        _id: deliveryPoint._id,
        name: deliveryPoint.name,
        location: deliveryPoint.location,
        operatingHours: deliveryPoint.operatingHours,
        contactInfo: deliveryPoint.contactInfo,
      },
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate("products.product", "name price images")
      .lean();

    const orderForEmail = {
      ...populatedOrder,
      totalAmount: Number(populatedOrder.total),
      _id: populatedOrder._id.toString(),
      products: populatedOrder.products.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
        quantity: Number(item.quantity),
      })),
    };

    await sendOrderConfirmationEmail(populatedOrder.user.email, orderForEmail);

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const orders = await Order.find({ user: userId })
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

export const getOrderById = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (order.user._id.toString() !== userId) {
      throw { status: 403, message: "Unauthorized to access this order" };
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      throw { status: 400, message: "Status is required" };
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (status === "cancelled" && order.status !== "cancelled") {
      await Promise.all(
        order.products.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          })
        )
      );
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
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (order.user.toString() !== userId) {
      throw { status: 403, message: "Unauthorized to cancel this order" };
    }

    if (!["pending", "processing"].includes(order.status)) {
      throw { status: 400, message: "Cannot cancel order in current status" };
    }

    await Promise.all(
      order.products.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      )
    );

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "username email")
        .populate("products.product", "name price images")
        .sort("-orderDate")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateShippingInfo = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
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
    next(errorHandler(res, error.status || 500, error.message));
  }
};
