import ShippingZone from "../models/shipping.model.js";
import { errorHandler } from "../utils/error.js";

export const createShippingZone = async (req, res, next) => {
  try {
    const shippingZone = await ShippingZone.create(req.body);
    res.status(201).json({
      message: "Delivery point created successfully",
      shippingZone,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getShippingZones = async (req, res, next) => {
  try {
    const deliveryPoints = await ShippingZone.find()
      .select(
        "_id name location baseRate description freeShippingThreshold isActive operatingHours contactInfo"
      )
      .sort("name");

    res.status(200).json({
      message: "Delivery points fetched successfully",
      deliveryPoints: deliveryPoints.map((point) => ({
        _id: point._id,
        name: point.name,
        location: point.location,
        baseRate: point.baseRate,
        description: point.description,
        freeShippingThreshold: point.freeShippingThreshold,
        isActive: point.isActive,
        operatingHours: point.operatingHours,
        contactInfo: point.contactInfo,
      })),
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const calculateShippingCost = async ({ deliveryPointId, subtotal }) => {
  const deliveryPoint = await ShippingZone.findOne({
    _id: deliveryPointId,
    isActive: true,
  });

  if (!deliveryPoint) {
    throw { status: 400, message: "Delivery point not found or inactive" };
  }

  if (
    deliveryPoint.freeShippingThreshold &&
    subtotal >= deliveryPoint.freeShippingThreshold
  ) {
    return 0;
  }

  return deliveryPoint.baseRate;
};

export const updateShippingZone = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("Updating delivery point:", id, req.body); // Debug log

    const deliveryPoint = await ShippingZone.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deliveryPoint) {
      throw { status: 404, message: "Delivery point not found" };
    }

    console.log("Updated delivery point:", deliveryPoint); // Debug log

    res.status(200).json({
      message: "Delivery point updated successfully",
      deliveryPoint,
    });
  } catch (error) {
    console.error("Update error:", error); // Debug log
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getDeliveryPointDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deliveryPoint = await ShippingZone.findById(id).select("-__v");

    if (!deliveryPoint) {
      throw { status: 404, message: "Delivery point not found" };
    }

    res.status(200).json({
      message: "Delivery point details fetched successfully",
      deliveryPoint,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const toggleDeliveryPointStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deliveryPoint = await ShippingZone.findById(id);

    if (!deliveryPoint) {
      throw { status: 404, message: "Delivery point not found" };
    }

    deliveryPoint.isActive = !deliveryPoint.isActive;
    await deliveryPoint.save();

    res.status(200).json({
      message: `Delivery point ${
        deliveryPoint.isActive ? "activated" : "deactivated"
      } successfully`,
      deliveryPoint,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};

export const getShippingRate = async (req, res, next) => {
  try {
    const { deliveryPointId, subtotal } = req.query;

    if (!deliveryPointId || !subtotal) {
      throw { status: 400, message: "Missing required parameters" };
    }

    const shippingCost = await calculateShippingCost({
      deliveryPointId,
      subtotal: Number(subtotal),
    });

    res.status(200).json({
      message: "Shipping rate calculated successfully",
      cost: shippingCost,
    });
  } catch (error) {
    next(errorHandler(res, error.status || 500, error.message));
  }
};
