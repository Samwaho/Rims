import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
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
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    verificationCode: String,
    isVerified: Boolean,
    verificationExpriry: {
      type: Date,
      default: Date.now() + 1 * 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
