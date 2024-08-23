import mongoose from "mongoose";

const refreshTokenSchema = {
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
