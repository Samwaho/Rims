import mongoose from "mongoose";

const wheelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    diameter: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    offset: {
      type: Number,
      required: true,
    },
    boltPattern: {
      type: Number,
      required: true,
    },
    hubBore: {
      type: String,
      required: true,
    },
    wheelMaterial: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Wheel = mongoose.model("Wheel", wheelSchema);

export default Wheel;
