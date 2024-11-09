import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["mpesa", "bank"],
    required: true,
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  shippingInfo: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    updatedAt: Date,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
