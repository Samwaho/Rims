import mongoose from "mongoose";

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
    },
    stock: {
      type: Number,
      required: true,
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
    },
    brand: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    // Dynamic fields for different product types
    productType: {
      type: String,
      required: true,
      enum: ["general", "wheel", "rim"],
    },
    productDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, strict: false }
);

// Middleware to validate productDetails based on productType
productSchema.pre("save", function (next) {
  if (this.productType === "wheel" || this.productType === "rim") {
    const requiredFields = ["diameter", "width", "boltPattern", "offset"];
    for (let field of requiredFields) {
      if (!this.productDetails[field]) {
        return next(new Error(`${field} is required for ${this.productType}`));
      }
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
