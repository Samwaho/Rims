import mongoose from "mongoose";

const taxConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  applicableCounties: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const TaxConfig = mongoose.model("TaxConfig", taxConfigSchema);
export default TaxConfig;
