import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

// Helper functions
const validateUser = (req) => {
  if (!req.user?.id) {
    throw { status: 401, message: "User not authenticated" };
  }
  return req.user.id;
};

const formatUserResponse = (user) => ({
  ...user.toObject(),
  password: undefined,
  verificationCode: undefined,
  verificationExpiry: undefined,
});

// Controllers
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = validateUser(req);

    const user = await User.findById(userId)
      .select("-password -verificationCode -verificationExpiry")
      .populate("wishlist")
      .populate({
        path: "orders",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "reviews",
        populate: { path: "product", select: "name" },
      });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    res.status(200).json({
      status: "success",
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { firstName, lastName, phoneNumber, email } = req.body;

    if (!firstName || !lastName || !email) {
      throw { status: 422, message: "Please fill in all required fields" };
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw { status: 409, message: "Email already in use" };
      }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.email = email;

    const updatedUser = await user.save();

    res.status(200).json({
      status: "success",
      data: formatUserResponse(updatedUser),
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { street, city, county, postalCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    user.address = {
      street: street || user.address?.street,
      city: city || user.address?.city,
      county: county || user.address?.county,
      postalCode: postalCode || user.address?.postalCode,
    };

    const updatedUser = await user.save();

    res.status(200).json({
      status: "success",
      data: updatedUser.address,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const productId = req.params.productId;

    if (!productId) {
      throw { status: 422, message: "Product ID is required" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(user._id).populate("wishlist");

    res.status(200).json({
      status: "success",
      data: updatedUser.wishlist,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const productId = req.params.productId;

    if (!productId) {
      throw { status: 422, message: "Product ID is required" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    const updatedUser = await User.findById(user._id).populate("wishlist");

    res.status(200).json({
      status: "success",
      data: updatedUser.wishlist,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updatePaymentMethods = async (req, res, next) => {
  try {
    const userId = validateUser(req);
    const { paymentMethods } = req.body;

    if (!Array.isArray(paymentMethods)) {
      throw { status: 422, message: "Payment methods must be an array" };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    user.paymentMethods = paymentMethods;
    await user.save();

    res.status(200).json({
      status: "success",
      data: user.paymentMethods,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const userId = validateUser(req);

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.status(200).json({
      status: "success",
      data: user.preferences,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select("-password -verificationCode -verificationExpiry")
        .populate("orders")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    const formattedUsers = users.map(formatUserResponse);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: formattedUsers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = validateUser(req);

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};
