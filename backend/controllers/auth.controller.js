import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        subject: "refreshToken",
      }
    );

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
    });
    user = { ...user._doc, accessToken, refreshToken };
    return res.status(200).json(user);
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

export async function ensureAuthenticated(req, res, next) {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return errorHandler(res, 401, "Access denied. Please login.");
  }
  try {
    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = { id: decodedAccessToken.userId };
    next();
  } catch (error) {
    return errorHandler(res, 401, "Invalid access token.");
  }
}

export function authorize(roles = []) {
  return async function (req, res, next) {
    const user = await User.findById(req.user.id);
    if (!user || !roles.includes(user.role)) {
      return errorHandler(
        res,
        403,
        "Access denied. You don't have the required permissions."
      );
    }
    next();
  };
}

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorHandler(res, 401, "Refresh token is required.");
    }
    const token = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const userRefreshToken = await RefreshToken.findOne({
      token,
      userId: token.userId,
    });
    if (!userRefreshToken) {
      return errorHandler(res, 401, "Invalid refresh token.");
    }
    await RefreshToken.deleteOne({ _id: userRefreshToken._id });
    const newAccessToken = jwt.sign(
      { userId: token.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        subject: "accessApi",
      }
    );

    const newRefreshToken = jwt.sign(
      { userId: token.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        subject: "refreshToken",
      }
    );
    await RefreshToken.create({
      token: newRefreshToken,
      userId: token.userId,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
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
