import axios from "axios";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { generateToken } from "../utils/pesapal.js";
import { sendOrderConfirmationEmail } from "../utils/sendEmails.js";
import { updateProductStock } from "../controllers/order.controller.js";
import Cart from "../models/cart.model.js";

const PESAPAL_API_URL = process.env.PESAPAL_API_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

export const initiatePesapalPayment = async (req, res) => {
  try {
    const { amount, description, email, orderData } = req.body;

    if (!amount || !description || !email || !orderData) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Amount, description, and email are required",
      });
    }

    const token = await generateToken();
    const ipnId = crypto.randomUUID();

    // Register IPN URL
    const ipnResponse = await axios.post(
      `${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`,
      {
        url: `${process.env.BACKEND_URL}/api/payments/pesapal/ipn`,
        ipn_notification_type: "POST",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (ipnResponse.data.error) {
      throw new Error(
        `IPN Registration failed: ${ipnResponse.data.error.message}`
      );
    }

    // Submit payment request
    const paymentResponse = await axios.post(
      `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`,
      {
        id: crypto.randomUUID(),
        currency: "USD",
        amount: parseFloat(amount),
        description,
        callback_url: `${FRONTEND_URL}/checkout?pesapal_status=completed`,
        notification_id: ipnResponse.data.ipn_id,
        billing_address: {
          email_address: orderData.paymentDetails?.customerEmail || email,
          phone_number: orderData.shippingDetails?.contactNumber || null,
          country_code: orderData.shippingDetails?.countryCode || "US",
          first_name:
            orderData.paymentDetails?.customerName?.split(" ")[0] || "",
          last_name:
            orderData.paymentDetails?.customerName?.split(" ")[1] || "",
          line_1: orderData.shippingDetails?.addressLine1 || "",
          line_2: orderData.shippingDetails?.addressLine2 || "",
          city: orderData.shippingDetails?.city || "",
          state: orderData.shippingDetails?.state || "",
          zip: orderData.shippingDetails?.postalCode || "",
        },
        cancellation_url: `${FRONTEND_URL}/checkout?pesapal_status=cancelled`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (paymentResponse.data.error) {
      throw new Error(
        `Payment initiation failed: ${paymentResponse.data.error.message}`
      );
    }

    // Create order in database
    const order = await Order.create({
      user: req.user.id,
      products: await Promise.all(
        orderData.products.map(async (item) => {
          const product = await Product.findById(item.product);
          return {
            product: product._id,
            quantity: item.quantity,
            price: product.price,
            shippingCost: product.shippingCost || 0,
          };
        })
      ),
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      paymentMethod: "pesapal",
      paymentDetails: {
        pesapalTrackingId: paymentResponse.data.order_tracking_id,
        ipnId: ipnResponse.data.ipn_id,
        status: "pending",
        amount: orderData.total,
        customerEmail: orderData.paymentDetails.customerEmail,
        customerName: orderData.paymentDetails.customerName,
      },
      status: "order_submitted",
      paymentStatus: "pending",
      orderDate: new Date(),
      shippingDetails: orderData.shippingDetails,
      discount: orderData.discount,
    });

    const populatedOrder = await order.populate([
      { path: "user", select: "username email firstName lastName" },
      { path: "products.product", select: "name price images" },
    ]);

    // Send order confirmation email
    try {
      const emailSent = await sendOrderConfirmationEmail(
        populatedOrder.user.email,
        populatedOrder
      );

      if (!emailSent) {
        console.error("Failed to send order confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
    }

    res.json({
      redirectUrl: paymentResponse.data.redirect_url,
      trackingId: paymentResponse.data.order_tracking_id,
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      error: "Failed to initiate payment",
      details: error.response?.data || error.message,
    });
  }
};

export const handlePesapalIPN = async (req, res) => {
  try {
    const { OrderTrackingId } = req.body;
    const token = await generateToken();

    const statusResponse = await axios.get(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const order = await Order.findOne({
      "paymentDetails.pesapalTrackingId": OrderTrackingId,
    }).populate("products.product user");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentStatus = statusResponse.data.payment_status_description;
    const isCompleted = paymentStatus.toLowerCase() === "completed";

    // Only update stock if payment is completed and order wasn't already completed
    if (isCompleted && order.paymentStatus !== "completed") {
      try {
        // Update stock for all products in the order
        await Promise.all(
          order.products.map(async (item) => {
            await updateProductStock(item.product._id, item.quantity);
          })
        );

        // Clear the user's cart
        await Cart.findOneAndUpdate(
          { user: order.user._id },
          { $set: { items: [] } },
          { new: true }
        );

        // Update order status
        order.paymentStatus = "completed";
        order.paymentDetails.status = paymentStatus;
        order.paymentDetails.verificationResponse = statusResponse.data;
        order.paymentDetails.verifiedAt = new Date();

        await order.save();
      } catch (error) {
        console.error("Failed to update stock:", error);
        return res.status(500).json({
          error: "Failed to update stock",
          message: error.message,
        });
      }
    } else {
      // Just update payment status if not completed
      order.paymentStatus = isCompleted ? "completed" : "pending";
      order.paymentDetails.status = paymentStatus;
      order.paymentDetails.verificationResponse = statusResponse.data;
      order.paymentDetails.verifiedAt = new Date();

      await order.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Pesapal IPN error:", error);
    res.status(500).json({ error: "Failed to process IPN" });
  }
};

export const getPesapalTransactionStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    if (!trackingId) {
      return res.status(400).json({ error: "Missing tracking ID" });
    }

    const token = await generateToken();
    const statusResponse = await axios.get(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const paymentStatus = statusResponse.data.payment_status_description;
    let mappedStatus = "pending";

    if (paymentStatus === "COMPLETED") {
      mappedStatus = "completed";
    } else if (paymentStatus === "INVALID") {
      mappedStatus =
        statusResponse.data.error?.message === "Pending Payment"
          ? "pending"
          : "failed";
    } else if (paymentStatus === "FAILED") {
      mappedStatus = "failed";
    }

    const order = await Order.findOne({
      "paymentDetails.pesapalTrackingId": trackingId,
    });

    if (
      order &&
      mappedStatus === "completed" &&
      order.paymentStatus !== "completed"
    ) {
      order.paymentStatus = "completed";
      order.paymentDetails = {
        ...order.paymentDetails,
        verificationResponse: statusResponse.data,
        verifiedAt: new Date(),
        status: paymentStatus,
      };
      await order.save();
    }

    res.json({
      status: mappedStatus,
      rawStatus: paymentStatus,
      details: {
        amount: statusResponse.data.amount,
        currency: statusResponse.data.currency,
        merchantReference: statusResponse.data.merchant_reference,
        paymentMethod: statusResponse.data.payment_method,
        message:
          statusResponse.data.error?.message || statusResponse.data.message,
        createdDate: statusResponse.data.created_date,
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      error: "Failed to check payment status",
      details: error.response?.data || error.message,
    });
  }
};
