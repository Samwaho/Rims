import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      county: String,
      postalCode: String,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    verificationCode: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationExpiry: {
      type: Date,
      default: Date.now() + 1 * 60 * 60 * 1000,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
    paymentMethods: [
      {
        type: String,
        cardNumber: String,
        expiryDate: String,
        cardHolderName: String,
      },
    ],
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
