import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

dotenv.config();
export async function ensureAuthenticated(req, res, next) {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return errorHandler(res, 401, "Access denied. Please login.");
    }
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = { id: decodedToken.userId };

    next();
  } catch (error) {
    return errorHandler(res, 401, "Invalid Access Token");
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
