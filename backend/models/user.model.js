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
    // Add reviews field to track user's reviews
    reviews: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        review: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
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

// Add a method to check if user has reviewed a product
userSchema.methods.hasReviewedProduct = function (productId) {
  return this.reviews.some(
    (review) => review.product.toString() === productId.toString()
  );
};

// Add a method to add a review reference
userSchema.methods.addReview = function (productId, reviewId) {
  if (!this.hasReviewedProduct(productId)) {
    this.reviews.push({
      product: productId,
      review: reviewId,
    });
  }
};

// Add a method to remove a review reference
userSchema.methods.removeReview = function (productId) {
  this.reviews = this.reviews.filter(
    (review) => review.product.toString() !== productId.toString()
  );
};

const User = mongoose.model("User", userSchema);

export default User;
