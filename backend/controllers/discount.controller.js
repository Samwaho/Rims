import Discount from "../models/discount.model.js";
import { errorHandler } from "../utils/error.js";

export const createDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.create(req.body);
    console.log("Created Discount:", JSON.stringify(discount, null, 2));
    res.status(201).json({
      message: "Discount code created successfully",
      discount,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const validateDiscount = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateDiscountCode(code, subtotal);
    res.status(200).json({
      message: "Discount code is valid",
      discount: result.discount,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getAllDiscounts = async (req, res, next) => {
  try {
    const { active } = req.query;
    const query = active ? { isActive: active === "true" } : {};

    const discounts = await Discount.find(query).sort("-createdAt");
    res.status(200).json({
      message: "Discounts fetched successfully",
      discounts,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!discount) {
      throw { status: 404, message: "Discount not found" };
    }

    res.status(200).json({
      message: "Discount updated successfully",
      discount,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const deleteDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByIdAndDelete(id);

    if (!discount) {
      throw { status: 404, message: "Discount not found" };
    }

    res.status(200).json({
      message: "Discount deleted successfully",
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const validateDiscountCode = async ({ code, subtotal }) => {
  if (!code) return { discount: 0 };

  const discount = await Discount.findOne({
    code,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    usageLimit: { $gt: 0 },
  });

  if (!discount) {
    throw { status: 400, message: "Invalid discount code" };
  }

  if (subtotal < discount.minPurchase) {
    throw {
      status: 400,
      message: `Minimum purchase amount of ${discount.minPurchase} required for this discount`,
    };
  }

  let discountAmount;
  if (discount.type === "percentage") {
    discountAmount = subtotal * (discount.value / 100);
  } else {
    discountAmount = discount.value;
  }

  if (discount.maxDiscount) {
    discountAmount = Math.min(discountAmount, discount.maxDiscount);
  }

  // Update usage count
  await Discount.findByIdAndUpdate(discount._id, {
    $inc: { usedCount: 1, usageLimit: -1 },
  });

  return { discount: discountAmount };
};
