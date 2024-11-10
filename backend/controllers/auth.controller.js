import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  sendPasswordResetSuccessEmail,
  sendResetEmail,
} from "../utils/sendVerificationEmail.js";

dotenv.config();

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRE;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const createAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    subject: "accessApi",
  });
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("access_token", accessToken, getCookieOptions());
};

export const signUpController = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return errorHandler(res, 422, "Please fill in all required fields");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorHandler(res, 409, "Email already exists");
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

export const signInController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorHandler(res, 422, "Please fill in all required fields");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return errorHandler(res, 401, "Invalid credentials");
    }

    const accessToken = createAccessToken(user._id);
    setAccessTokenCookie(res, accessToken);

    const userResponse = { ...user._doc };
    delete userResponse.password;

    return res.status(200).json({ ...userResponse, accessToken });
  } catch (error) {
    next(error);
  }
};

export const getAuthUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return errorHandler(res, 404, "User not found");
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { access_token: refreshToken } = req.cookies;
    if (!refreshToken) {
      return errorHandler(res, 401, "Refresh token is required.");
    }

    const token = jwt.verify(refreshToken, JWT_SECRET);
    if (!token) {
      return errorHandler(res, 401, "Invalid access token.");
    }

    const newAccessToken = createAccessToken(token.userId);
    setAccessTokenCookie(res, newAccessToken);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return errorHandler(res, 401, "Refresh token expired or invalid.");
    }
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    res.clearCookie("access_token", getCookieOptions());
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorHandler(res, 422, "Email is required");
    }

    const user = await User.findOne({ email });
    const genericResponse = {
      message: "If an account exists, you will receive a password reset email",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = bcryptjs.hashSync(resetToken, 10);
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSent = await sendResetEmail(email, resetLink);

    if (!emailSent) {
      return errorHandler(res, 500, "Error sending reset email");
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!token || !newPassword) {
      return errorHandler(res, 422, "Missing required fields");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return errorHandler(res, 401, "Invalid or expired reset token");
    }

    const user = await User.findOne({
      _id: decodedToken.userId,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || !bcryptjs.compareSync(token, user.resetPasswordToken)) {
      return errorHandler(res, 401, "Invalid or expired reset token");
    }

    user.password = bcryptjs.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendPasswordResetSuccessEmail(user.email);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
