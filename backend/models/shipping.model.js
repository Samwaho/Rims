import mongoose from "mongoose";

const shippingZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    baseRate: {
      type: Number,
      required: true,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      type: String,
      trim: true,
    },
    contactInfo: {
      phone: String,
      email: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShippingZone", shippingZoneSchema);
