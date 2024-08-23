import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signUpController = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorHandler(res, 422, "Please fill in all required fields");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorHandler(res, 409, "Email already exists");
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({ message: "User created successfully" });
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
    let user = await User.findOne({ email });

    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return errorHandler(res, 401, "Invalid credentials");
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
      subject: "accessApi",
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user = user._doc;
    return res.status(200).json({ ...user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const getAuthUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorHandler(res, 404, "User not found");
    }
    const { name, email, role } = user._doc;
    return res.status(200).json({ name, email, role });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const refreshToken = cookies.access_token;
    if (!refreshToken) {
      return errorHandler(res, 401, "Refresh token is required.");
    }
    const token = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (!token) {
      return errorHandler(res, 401, "Invalid access token.");
    }

    const newAccessToken = jwt.sign(
      { userId: token.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        subject: "accessApi",
      }
    );

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      accessToken: newAccessToken,
    });
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
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
