const Village = require("../models/Village");
const cloudinaryService = require("../services/cloudinaryService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/village  — get village info (public)
|--------------------------------------------------------------------------
*/
const getVillage = async (req, res, next) => {
  try {
    const village = await Village.findOne({ isActive: true }).lean();
    if (!village) {
      return res.status(404).json({ success: false, message: "Village information not found" });
    }
    return res.status(200).json({ success: true, data: { village } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/village  — create village info (admin)
|--------------------------------------------------------------------------
*/
const createVillage = async (req, res, next) => {
  try {
    const village = await Village.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, message: "Village created", data: { village } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/village/:id  — update village (admin)
|--------------------------------------------------------------------------
*/
const updateVillage = async (req, res, next) => {
  try {
    const village = await Village.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!village) return res.status(404).json({ success: false, message: "Village not found" });
    return res.status(200).json({ success: true, message: "Village updated", data: { village } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/village/:id/images  — upload village images (admin)
|--------------------------------------------------------------------------
*/
const uploadVillageImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }
    if (!env.cloudinary.enabled) {
      return res.status(503).json({ success: false, message: "Image upload not configured" });
    }

    const uploaded = await cloudinaryService.uploadMultipleImages(
      req.files,
      "smart-village/village"
    );

    const village = await Village.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: uploaded } } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Images uploaded", data: { village } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVillage, createVillage, updateVillage, uploadVillageImages };
