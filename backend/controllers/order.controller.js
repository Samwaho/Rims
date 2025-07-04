import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { errorHandler } from "../utils/error.js";
import { validateDiscountCode } from "../controllers/discount.controller.js";
import { sendOrderConfirmationEmail } from "../utils/sendEmails.js";
import { isValidCountryCode, formatPhoneNumber, validatePhoneNumber } from "../utils/countries.js";

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

export const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  if (product.stock < quantity) {
    throw {
      status: 400,
      message: `Insufficient stock for product: ${product.name}`,
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } },
    { new: true, runValidators: true }
  );

  if (updatedProduct.stock < 0) {
    throw {
      status: 400,
      message: `Insufficient stock for product: ${product.name}`,
    };
  }

  return updatedProduct;
};

const calculateOrderTotals = async (
  subtotal,
  shippingDetails,
  discountCode = null
) => {
  let discountDetails = null;
  let discountAmount = 0;

  if (discountCode) {
    try {
      const discountResult = await validateDiscountCode({
        code: discountCode,
        subtotal,
      });

      discountAmount = discountResult.discount;
      discountDetails = {
        code: discountCode,
        type: discountResult.type,
        value: discountResult.value,
        amount: discountAmount
      };
    } catch (error) {
      console.error("Discount validation error:", error);
    }
  }

  const total = subtotal - discountAmount;

  return {
    subtotal,
    discount: discountAmount,
    discountDetails,
    total,
  };
};

const processDirectPurchase = async (
  productId,
  quantity = 1,
  shippingDetails,
  discountCode = null
) => {
  const product = await Product.findById(productId);
  await validateProduct(product, quantity);

  const orderProduct = {
    product: product._id,
    quantity,
    shippingCost: product.shippingCost || 0,
  };

  // Update stock and handle any errors
  try {
    await updateProductStock(product._id, quantity);
  } catch (error) {
    throw { status: error.status || 500, message: error.message };
  }

  const subtotal = product.price * quantity;
  const shippingCost = product.shippingCost * quantity;

  return {
    orderProducts: [orderProduct],
    ...(await calculateOrderTotals(subtotal, shippingDetails, discountCode)),
    shippingCost,
  };
};

const processCartPurchase = async (
  userId,
  shippingDetails,
  discountCode = null
) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart?.items?.length) {
    throw { status: 400, message: "Cart is empty" };
  }

  let subtotal = 0;
  let shippingCost = 0;
  const orderProducts = [];

  // Validate all products first
  for (const item of cart.items) {
    const { product, quantity } = item;
    await validateProduct(product, quantity);
  }

  // Process each item and update stock
  try {
    for (const item of cart.items) {
      const { product, quantity } = item;

      // Update stock for each product
      await updateProductStock(product._id, quantity);

      subtotal += product.price * quantity;
      shippingCost += (product.shippingCost || 0) * quantity;

      orderProducts.push({
        product: product._id,
        quantity,
        shippingCost: product.shippingCost || 0,
      });
    }

    // Clear the cart after successful stock updates
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );
  } catch (error) {
    // If any stock update fails, throw the error
    throw { status: error.status || 500, message: error.message };
  }

  return {
    orderProducts,
    ...(await calculateOrderTotals(subtotal, shippingDetails, discountCode)),
    shippingCost,
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const {
      productId,
      quantity,
      products,
      paymentMethod,
      paymentDetails,
      discount,
      shippingDetails,
    } = req.body;

    // Validate shipping details
    if (
      !shippingDetails?.addressLine1 ||
      !shippingDetails?.city ||
      !shippingDetails?.state ||
      !shippingDetails?.postalCode ||
      !shippingDetails?.country ||
      !shippingDetails?.countryCode ||
      !shippingDetails?.contactNumber
    ) {
      throw {
        status: 400,
        message: "Required shipping details are missing. Please provide complete address information."
      };
    }

    // Validate country code
    if (!isValidCountryCode(shippingDetails.countryCode)) {
      throw { status: 400, message: "Invalid country code" };
    }

    // Format phone number based on country code
    shippingDetails.contactNumber = formatPhoneNumber(
      shippingDetails.contactNumber,
      shippingDetails.countryCode
    );

    let orderData;
    if (productId) {
      orderData = await processDirectPurchase(
        productId,
        quantity,
        shippingDetails,
        discount?.code
      );
    } else if (products && products.length > 0) {
      orderData = await processCartPurchase(
        userId,
        shippingDetails,
        discount?.code
      );
    } else {
      throw { status: 400, message: "Invalid order data" };
    }

    const order = await Order.create({
      user: userId,
      products: orderData.orderProducts,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      discountDetails: orderData.discountDetails,
      shippingCost: orderData.shippingCost,
      total: orderData.subtotal - (orderData.discount || 0),
      status: "order_submitted",
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        amount: orderData.subtotal - (orderData.discount || 0),
      },
      paymentStatus: "pending",
      shippingDetails,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email firstName lastName")
      .populate(
        "products.product",
        "name price images shippingCost deliveryTime"
      )
      .lean();

    // Send order confirmation email
    try {
      const userEmail = populatedOrder.user.email;
      const emailSent = await sendOrderConfirmationEmail(
        userEmail,
        populatedOrder
      );

      if (!emailSent) {
        console.error("Failed to send order confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
    }

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
      .populate("user", "username email firstName lastName")
      .populate("products.product", "name price images")
      .sort("-orderDate")
      .lean();

    const transformedOrders = orders.map((order) => ({
      ...order,
      user: {
        ...order.user,
        name: `${order.user.firstName} ${order.user.lastName}`.trim(),
      },
    }));

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: transformedOrders,
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
      .populate("user", "username email firstName lastName")
      .populate(
        "products.product",
        "name price images shippingCost deliveryTime"
      )
      .lean();

    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (order.user._id.toString() !== userId) {
      throw { status: 403, message: "Unauthorized to access this order" };
    }

    const transformedOrder = {
      ...order,
      user: {
        ...order.user,
        name: `${order.user.firstName} ${order.user.lastName}`.trim(),
      },
    };

    res.status(200).json({
      message: "Order fetched successfully",
      order: transformedOrder,
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

    const validStatuses = [
      "order_submitted",
      "processing",
      "in_transit",
      "shipped",
      "under_clearance",
      "out_for_delivery",
      "delivered",
    ];

    if (!validStatuses.includes(status)) {
      throw { status: 400, message: "Invalid status value" };
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    const previousStatus = order.status;
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

    // Send status update email for specific status changes
    if (
      ["shipped", "delivered"].includes(status) &&
      status !== previousStatus
    ) {
      try {
        await sendOrderConfirmationEmail(
          updatedOrder.user.email,
          updatedOrder,
          status
        );
      } catch (emailError) {
        console.error("Failed to send order status update email:", emailError);
      }
    }

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
        .populate("user", "username email firstName lastName")
        .populate("products.product", "name price buyingPrice images")
        .sort("-orderDate")
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Order.countDocuments(query),
    ]);

    const transformedOrders = orders.map((order) => {
      const total = order.total;
      const productCost = order.products.reduce(
        (sum, item) => sum + (item.product?.buyingPrice || 0) * item.quantity,
        0
      );

      const totalCosts =
        productCost +
        (order.tax || 0) +
        (order.shippingCost || 0) +
        (order.deliveryCost || 0);

      const user = {
        ...order.user,
        name: `${order.user.firstName} ${order.user.lastName}`.trim(),
      };

      return {
        ...order,
        user,
        total,
        profit: total - totalCosts,
      };
    });

    if (orders.length > 0) {
      await Order.updateMany(
        { _id: { $in: orders.map((order) => order._id) } },
        { $set: { viewed: true } }
      );
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: transformedOrders,
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

export const updateOrderCosts = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { shippingCost, deliveryCost } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (shippingCost !== undefined) {
      order.shippingCost = shippingCost;
    }
    if (deliveryCost !== undefined) {
      order.deliveryCost = deliveryCost;
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "username email")
      .populate("products.product", "name price buyingPrice images");

    res.status(200).json({
      message: "Order costs updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (order.status !== "cancelled") {
      await Promise.all(
        order.products.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          })
        )
      );
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getNewOrdersCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({ viewed: false });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const markOrdersAsViewed = async (req, res, next) => {
  try {
    const { orderIds } = req.body;

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { viewed: true } }
    );

    res.status(200).json({
      message: "Orders marked as viewed successfully",
    });
  } catch (error) {
    next(error);
  }
};
