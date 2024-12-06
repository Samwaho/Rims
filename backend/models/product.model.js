import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PRODUCT_TYPES = ["oem", "aftermarket", "alloy"];

const PRODUCT_CONDITIONS = ["new", "used"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    buyingPrice: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ["general", "wheels", "tyres"],
    },
    size: {
      type: String,
      required: true,
    },
    madeIn: {
      type: String,
    },
    specifications: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    reviews: [reviewSchema],
    numReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    productType: {
      type: String,
      required: true,
      enum: PRODUCT_TYPES,
      default: "original",
    },
    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      default: "new",
    },
  },
  { timestamps: true }
);

// Add a method to calculate average rating
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    this.averageRating =
      this.reviews.reduce((acc, review) => acc + review.rating, 0) /
      this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Add this before creating the model
productSchema.pre("save", function (next) {
  if (this.stock < 0) {
    next(new Error("Product stock cannot be negative"));
  }
  next();
});

// Add this before creating the model
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.$inc && update.$inc.stock) {
    // If the update would result in negative stock, prevent it
    this.model
      .findOne(this.getQuery())
      .then((product) => {
        if (product.stock + update.$inc.stock < 0) {
          next(new Error("Product stock cannot be negative"));
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;

export { PRODUCT_TYPES, PRODUCT_CONDITIONS };
