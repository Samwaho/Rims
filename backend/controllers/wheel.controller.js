import Wheel from "../models/wheel.model.js";

export const getWheels = async (req, res) => {
  try {
    const wheels = await Wheel.find();
    res.status(200).json(wheels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWheelById = async (req, res) => {
  try {
    const wheel = await Wheel.findById(req.params.id);
    res.status(200).json(wheel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWheel = async (req, res) => {
  const wheel = new Wheel(req.body);
  try {
    const newWheel = await wheel.save();
    res.status(201).json(newWheel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWheel = async (req, res) => {
  try {
    const updatedWheel = await Wheel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedWheel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWheel = async (req, res) => {
  try {
    await Wheel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Wheel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
