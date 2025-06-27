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

// New categories with their specific requirements
const PRODUCT_CATEGORIES = ["rims", "offroad-rims", "tyres", "accessories", "cars"];

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
      enum: PRODUCT_CATEGORIES,
    },
    // Make size optional for some categories
    size: {
      type: String,
      required: function() {
        // Size is required for rims, offroad-rims, and tyres
        return ["rims", "offroad-rims", "tyres"].includes(this.category);
      },
    },
    madeIn: {
      type: String,
    },
    // Category-specific fields
    brand: {
      type: String,
      required: function() {
        // Brand is required for all categories except accessories
        return this.category !== "accessories";
      },
    },
    model: {
      type: String,
      required: function() {
        // Model is required for cars and some other categories
        return ["cars", "rims", "offroad-rims", "tyres"].includes(this.category);
      },
    },
    // Car-specific fields
    year: {
      type: Number,
      required: function() {
        return this.category === "cars";
      },
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    mileage: {
      type: Number,
      required: function() {
        return this.category === "cars";
      },
      min: 0,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "lpg"],
      required: function() {
        return this.category === "cars";
      },
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "cvt"],
      required: function() {
        return this.category === "cars";
      },
    },
    // Rim-specific fields
    wheelDiameter: {
      type: Number,
      required: function() {
        return ["rims", "offroad-rims"].includes(this.category);
      },
      min: 13,
      max: 26,
    },
    wheelWidth: {
      type: Number,
      required: function() {
        return ["rims", "offroad-rims"].includes(this.category);
      },
      min: 4,
      max: 15,
    },
    offset: {
      type: Number,
      required: function() {
        return ["rims", "offroad-rims"].includes(this.category);
      },
    },
    boltPattern: {
      type: String,
      required: function() {
        return ["rims", "offroad-rims"].includes(this.category);
      },
    },
    // Tyre-specific fields
    loadIndex: {
      type: String,
      required: function() {
        return this.category === "tyres";
      },
    },
    speedRating: {
      type: String,
      required: function() {
        return this.category === "tyres";
      },
    },
    treadDepth: {
      type: Number,
      required: function() {
        return this.category === "tyres";
      },
      min: 0,
    },
    // Accessory-specific fields
    compatibility: {
      type: [String],
      required: function() {
        return this.category === "accessories";
      },
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
      default: "oem",
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

export { PRODUCT_TYPES, PRODUCT_CONDITIONS, PRODUCT_CATEGORIES };
