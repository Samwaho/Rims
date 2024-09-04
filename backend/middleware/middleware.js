import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

dotenv.config();
export async function ensureAuthenticated(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return errorHandler(res, 401, "Access denied. Please login.");
    }

    const parts = authorizationHeader.split(" ");
    if (parts[0] !== "Bearer") {
      return errorHandler(res, 401, "Invalid Access Token");
    }

    const accessToken = parts[1];
    if (!accessToken) {
      return errorHandler(res, 401, "Invalid Access Token");
    }

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
