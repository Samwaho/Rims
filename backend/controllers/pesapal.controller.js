import axios from "axios";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const PESAPAL_API_URL = process.env.PESAPAL_API_URL;
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const generateToken = async () => {
  try {
    console.log("Attempting to generate Pesapal token...");

    const payload = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    };

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

    if (!response.data.token) {
      throw new Error("No token in response");
    }

    return response.data.token;
  } catch (error) {
    console.error("Token generation error:", error.response?.data || error);
    throw error;
  }
};

const generateValidIpnId = () => {
  return crypto.randomUUID();
};

export const initiatePesapalPayment = async (req, res) => {
  try {
    const { amount, description, email, orderData } = req.body;

    if (!amount || !description || !email || !orderData) {
      console.error("Missing required fields:", { amount, description, email });
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Amount, description, and email are required",
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be a positive number",
      });
    }

    const token = await generateToken();

    const ipnRegistrationPayload = {
      url: `${process.env.BACKEND_URL}/api/payments/pesapal/ipn`,
      ipn_notification_type: "POST",
    };

    console.log("Registering IPN URL:", ipnRegistrationPayload);

    const ipnResponse = await axios.post(
      `${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`,
      ipnRegistrationPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("IPN Registration response:", ipnResponse.data);

    if (ipnResponse.data.error) {
      throw new Error(
        `IPN Registration failed: ${ipnResponse.data.error.message}`
      );
    }

    const ipnId = ipnResponse.data.ipn_id;

    const userFirstName =
      orderData.paymentDetails?.customerName?.split(" ")[0] || "";
    const userLastName =
      orderData.paymentDetails?.customerName?.split(" ")[1] || "";

    const payload = {
      id: crypto.randomUUID(),
      currency: "KES",
      amount: parsedAmount,
      description: description,
      callback_url: `${FRONTEND_URL}/checkout?pesapal_status=completed`,
      notification_id: ipnId,
      ipn_url: `${process.env.BACKEND_URL}/api/payments/pesapal/ipn`,
      billing_address: {
        email_address: orderData.paymentDetails.customerEmail || email,
        phone_number: orderData.shippingDetails?.contactNumber || null,
        country_code: "KE",
        first_name: userFirstName,
        middle_name: "",
        last_name: userLastName,
        line_1: orderData.shippingDetails?.roadName || "",
        line_2: orderData.shippingDetails?.estateName || "",
        city: orderData.shippingDetails?.city || "",
        state: orderData.shippingDetails?.subCounty || "",
        postal_code: "",
        zip_code: "",
      },
      cancellation_url: `${FRONTEND_URL}/checkout?pesapal_status=cancelled`,
    };

    console.log("Sending payment request to Pesapal:", {
      url: `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`,
      payload,
      customerDetails: {
        name: orderData.paymentDetails.customerName,
        email: orderData.paymentDetails.customerEmail,
      },
    });

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

    console.log("Payment response:", pesapalResponse.data);

    if (pesapalResponse.data.error) {
      throw new Error(
        `Payment initiation failed: ${pesapalResponse.data.error.message}`
      );
    }

    let products = [];
    let subtotal = 0;
    let shippingCost = 0;

    if (orderData.productId) {
      // Single product purchase
      const product = await Product.findById(orderData.productId);
      if (!product) {
        throw new Error("Product not found");
      }
      products = [
        {
          product: product._id,
          quantity: orderData.quantity || 1,
          price: product.price,
          shippingCost: product.shippingCost || 0,
        },
      ];
      subtotal = product.price * (orderData.quantity || 1);
      shippingCost = (product.shippingCost || 0) * (orderData.quantity || 1);
    } else {
      // Cart purchase
      products = await Promise.all(
        orderData.products.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Product ${item.product} not found`);
          }
          subtotal += product.price * item.quantity;
          shippingCost += (product.shippingCost || 0) * item.quantity;
          return {
            product: product._id,
            quantity: item.quantity,
            price: product.price,
            shippingCost: product.shippingCost || 0,
          };
        })
      );
    }

    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user.id,
      products: products,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
      paymentMethod: "pesapal",
      paymentDetails: {
        pesapalTrackingId: pesapalResponse.data.order_tracking_id,
        ipnId: ipnId,
        provider: "pesapal",
        status: "pending",
        amount: parsedAmount,
        currency: "KES",
        description: description,
        customerEmail: orderData.paymentDetails.customerEmail,
        customerName: orderData.paymentDetails.customerName,
      },
      status: "order_submitted",
      paymentStatus: "pending",
      orderDate: new Date(),
      shippingDetails: {
        city: orderData.shippingDetails.city,
        subCounty: orderData.shippingDetails.subCounty,
        estateName: orderData.shippingDetails.estateName,
        roadName: orderData.shippingDetails.roadName,
        apartmentName: orderData.shippingDetails.apartmentName,
        houseNumber: orderData.shippingDetails.houseNumber,
        contactNumber: orderData.shippingDetails.contactNumber,
      },
      discount: orderData.discount
        ? {
            code: orderData.discount.code,
            type: orderData.discount.type,
            value: orderData.discount.value,
            amount: orderData.discount.amount,
          }
        : undefined,
    });

    console.log("Created order:", {
      id: order._id,
      products: order.products,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
    });

    const populatedOrder = await order.populate([
      { path: "user", select: "username email firstName lastName" },
      { path: "products.product", select: "name price images" },
    ]);

    res.json({
      redirectUrl: pesapalResponse.data.redirect_url,
      trackingId: pesapalResponse.data.order_tracking_id,
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Payment initiation error:", {
      error: error.response?.data || error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to initiate payment",
      details: error.response?.data || error.message,
    });
  }
};

export const handlePesapalIPN = async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } =
      req.body;

    console.log("Received IPN notification:", {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
    });

    const token = await generateToken();

    const statusResponse = await axios.get(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Payment status response:", statusResponse.data);

    const paymentStatus = statusResponse.data.payment_status_description;

    const order = await Order.findOne({
      "paymentDetails.pesapalTrackingId": OrderTrackingId,
    });

    if (!order) {
      console.error("Order not found for tracking ID:", OrderTrackingId);
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentStatus =
      paymentStatus.toLowerCase() === "completed" ? "paid" : "pending";

    order.paymentDetails = {
      ...order.paymentDetails,
      verificationResponse: statusResponse.data,
      verifiedAt: new Date(),
      status: paymentStatus,
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "IPN processed successfully",
    });
  } catch (error) {
    console.error("Pesapal IPN error:", error);
    res.status(500).json({ error: "Failed to process IPN" });
  }
};

export const registerPesapalIPN = async (req, res) => {
  try {
    const token = await generateToken();

    const ipnId = generateValidIpnId();

    const payload = {
      url: `${process.env.BACKEND_URL}/api/payments/pesapal/ipn`,
      ipn_notification_type: "POST",
      ipn_id: ipnId,
    };

    const response = await axios.post(
      `${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("IPN Registration response:", response.data);

    if (response.data.error) {
      return res.status(400).json({
        error: "IPN registration failed",
        details: response.data.error,
      });
    }

    res.json({
      success: true,
      message: "IPN URL registered successfully",
      data: response.data,
      ipnId: ipnId,
    });
  } catch (error) {
    console.error("IPN registration error:", error.response?.data || error);
    res.status(500).json({
      error: "Failed to register IPN URL",
      details: error.response?.data || error.message,
    });
  }
};
