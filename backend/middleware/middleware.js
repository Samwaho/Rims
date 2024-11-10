import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to verify JWT authentication
export async function ensureAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorHandler(res, 401, "Access denied. Please login.");
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return errorHandler(res, 401, "Invalid access token format");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
      next();
    } catch (jwtError) {
      return errorHandler(res, 401, "Invalid or expired access token");
    }
  } catch (error) {
    return errorHandler(res, 500, "Authentication error");
  }
}

// Role-based authorization middleware
export function authorize(roles = []) {
  if (!Array.isArray(roles)) {
    throw new Error("Roles parameter must be an array");
  }

  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return errorHandler(res, 401, "User not authenticated");
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return errorHandler(res, 404, "User not found");
      }

      if (!roles.includes(user.role)) {
        return errorHandler(res, 403, "Insufficient permissions");
      }

      next();
    } catch (error) {
      return errorHandler(res, 500, "Authorization error");
    }
  };
}
