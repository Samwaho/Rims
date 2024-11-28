import axios from "axios";
import crypto from "crypto";
import Order from "../models/order.model.js";

const PESAPAL_API_URL = process.env.PESAPAL_API_URL;
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const generateToken = async () => {
  try {
    console.log("Attempting to generate Pesapal token...");
    console.log("API URL:", PESAPAL_API_URL);

    const payload = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    };

    console.log("Request payload:", payload);

    const response = await axios.post(
      `${PESAPAL_API_URL}/api/Auth/RequestToken`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("Pesapal auth response:", response.data);

    if (response.data.error) {
      throw new Error(
        `Pesapal error: ${response.data.error.code} - ${response.data.error.message}`
      );
    }

    if (!response.data.token) {
      console.error("Unexpected response format:", response.data);
      throw new Error("No token in response");
    }

    console.log("Successfully generated token");
    return response.data.token;
  } catch (error) {
    if (error.response) {
      console.error("Pesapal API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
      throw new Error(
        `Pesapal API error: ${
          error.response.data?.error?.code || error.response.status
        }`
      );
    }
    console.error("Token generation error:", error);
    throw error;
  }
};

export const initiatePesapalPayment = async (req, res) => {
  try {
    const { amount, description, email, orderData } = req.body;

    if (!amount || !description || !email || !orderData) {
      console.log("Missing required parameters:", {
        amount,
        description,
        email,
        orderData,
      });
      return res.status(400).json({
        error: "Missing required parameters",
        received: { amount, description, email },
      });
    }

    // Generate token first
    const token = await generateToken();

    if (!token) {
      throw new Error("Failed to generate Pesapal token");
    }

    // Generate a valid IPN ID (must be alphanumeric, no special characters)
    const ipnId = `IPN${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    // Create Pesapal payment request
    const payload = {
      id: crypto.randomUUID(),
      currency: "KES",
      amount: parseFloat(amount),
      description: description,
      callback_url: `${FRONTEND_URL}/orders`, // Redirect to orders page after payment
      notification_id: ipnId, // Use the properly formatted IPN ID
      ipn_url: `${process.env.BACKEND_URL}/api/payments/pesapal/ipn`, // Add IPN URL
      billing_address: {
        email_address: email,
        phone_number: null,
        country_code: "KE",
        first_name: req.user?.firstName || "",
        middle_name: "",
        last_name: req.user?.lastName || "",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: "",
      },
    };

    console.log("Sending request to Pesapal:", payload);

    const pesapalResponse = await axios.post(
      `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Pesapal response:", pesapalResponse.data);

    // Handle Pesapal errors
    if (pesapalResponse.data.error) {
      return res.status(400).json({
        error: "Pesapal payment error",
        message: pesapalResponse.data.error.message,
        details: pesapalResponse.data.error,
      });
    }

    if (!pesapalResponse.data.redirect_url) {
      throw new Error("No redirect URL in Pesapal response");
    }

    // Only create order if Pesapal payment initiation was successful
    const order = await Order.create({
      ...orderData,
      user: req.user.id,
      paymentDetails: {
        pesapalTrackingId: pesapalResponse.data.order_tracking_id,
        ipnId: ipnId, // Store the IPN ID with the order
      },
      status: "pending",
      paymentStatus: "pending",
    });

    // Populate the order with necessary details
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email")
      .populate("products.product", "name price images");

    res.json({
      redirectUrl: pesapalResponse.data.redirect_url,
      trackingId: pesapalResponse.data.order_tracking_id,
      order: populatedOrder,
    });
  } catch (error) {
    console.error(
      "Pesapal payment initiation error:",
      error.response?.data || error
    );
    res.status(500).json({
      error: "Failed to initiate Pesapal payment",
      details: error.response?.data || error.message,
    });
  }
};

export const handlePesapalIPN = async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } =
      req.body;

    const token = await generateToken();

    // Get payment status from Pesapal
    const statusResponse = await axios.get(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const paymentStatus = statusResponse.data.payment_status_description;

    // Update order status based on Pesapal payment status
    const order = await Order.findOne({
      "paymentDetails.pesapalTrackingId": OrderTrackingId,
    });

    if (order) {
      order.paymentStatus =
        paymentStatus.toLowerCase() === "completed" ? "paid" : "pending";
      await order.save();
    }

    res.json({ status: "success" });
  } catch (error) {
    console.error("Pesapal IPN error:", error);
    res.status(500).json({ error: "Failed to process IPN" });
  }
};
