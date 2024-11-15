import TaxConfig from "../models/tax.model.js";
import { errorHandler } from "../utils/error.js";

export const createTaxConfig = async (req, res, next) => {
  try {
    const taxConfig = await TaxConfig.create(req.body);
    res.status(201).json({
      message: "Tax configuration created successfully",
      taxConfig,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getTaxConfigs = async (req, res, next) => {
  try {
    const taxConfigs = await TaxConfig.find({ isActive: true });
    res.status(200).json({
      message: "Tax configurations fetched successfully",
      taxConfigs,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const updateTaxConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taxConfig = await TaxConfig.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!taxConfig) {
      throw { status: 404, message: "Tax configuration not found" };
    }

    res.status(200).json({
      message: "Tax configuration updated successfully",
      taxConfig,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getTaxRate = async (county) => {
  const taxConfig = await TaxConfig.findOne({
    $or: [{ applicableCounties: county }, { isDefault: true }],
    isActive: true,
  });

  return taxConfig?.rate || 0.16; // Default to 16% if no config found
};
