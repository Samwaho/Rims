import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
        shippingCost: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountDetails: {
      code: String,
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      value: Number,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "order_submitted",
        "processing",
        "in_transit",
        "shipped",
        "under_clearance",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["pesapal"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      pesapalTrackingId: String,
    },
    shippingDetails: {
      city: {
        type: String,
        required: true,
      },
      subCounty: {
        type: String,
        required: true,
      },
      estateName: {
        type: String,
        required: true,
      },
      roadName: {
        type: String,
        required: true,
      },
      apartmentName: {
        type: String,
      },
      houseNumber: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    orderDate: {
      type: Date,
      default: Date.now,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
