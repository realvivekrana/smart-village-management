const GalleryPhoto = require("../models/GalleryPhoto");
const env = require("../config/env");
const cloudinaryService = require("../services/cloudinaryService");
const { createNotification } = require("../services/notificationService");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { submissionStatus } = require("../utils/publicVisibility");

const CATEGORIES = ["village", "festival", "farming", "event", "nature", "other"];

/*
| GET /api/v1/gallery   (public — sirf approved)
*/
const getPhotos = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 24, maxLimit: 60 });
    const filter = { status: "approved", isActive: true };
    if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;

    const [photos, total] = await Promise.all([
      GalleryPhoto.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryPhoto.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { photos },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| GET /api/v1/gallery/my   (logged-in)
*/
const getMyPhotos = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 24, maxLimit: 60 });
    const filter = { createdBy: req.user._id, isActive: true };

    const [photos, total] = await Promise.all([
      GalleryPhoto.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      GalleryPhoto.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { photos },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| GET /api/v1/gallery/admin/all   (admin)
*/
const getAllPhotosAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 24, maxLimit: 60 });
    const filter = { isActive: true };
    if (["pending", "approved", "rejected"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [photos, total] = await Promise.all([
      GalleryPhoto.find(filter)
        .populate("createdBy", "name phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryPhoto.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { photos },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| POST /api/v1/gallery   (logged-in, multipart: images[] , caption, category)
*/
const uploadPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Kam se kam ek photo chuniye" });
    }
    if (!env.cloudinary.enabled) {
      return res.status(503).json({
        success: false,
        message: "Photo upload abhi set up nahi hai (Cloudinary configure nahi hai)",
      });
    }

    const uploaded = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/gallery");
    const status = submissionStatus(req.user);
    const published = status === "approved";
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : "village";
    const caption = (req.body.caption || "").trim().slice(0, 200);

    const photos = await GalleryPhoto.insertMany(
      uploaded.map((img) => ({
        image: { url: img.url, publicId: img.publicId },
        caption,
        category,
        createdBy: req.user._id,
        status,
        reviewedBy: published ? req.user._id : null,
        reviewedAt: published ? new Date() : null,
      }))
    );

    return res.status(201).json({
      success: true,
      message: published
        ? "Photos published. Ab gallery me sabko dikh rahi hain."
        : "Photos submitted. Admin approval ke baad gallery me dikhengi.",
      data: { photos },
    });
  } catch (error) {
    next(error);
  }
};

/*
| DELETE /api/v1/gallery/:id   (owner / admin)
*/
const deletePhoto = async (req, res, next) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo || !photo.isActive) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(photo.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (env.cloudinary.enabled && photo.image?.publicId) {
      await cloudinaryService.deleteImage(photo.image.publicId);
    }

    photo.isActive = false;
    await photo.save();

    return res.status(200).json({ success: true, message: "Photo deleted" });
  } catch (error) {
    next(error);
  }
};

/*
| PATCH /api/v1/gallery/:id/review   (admin)
*/
const reviewPhoto = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }
    if (status === "rejected" && !(rejectionReason || "").trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo || !photo.isActive) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }

    photo.status = status;
    photo.rejectionReason = status === "rejected" ? rejectionReason.trim() : "";
    photo.reviewedBy = req.user._id;
    photo.reviewedAt = new Date();
    await photo.save();

    await createNotification({
      recipient: photo.createdBy,
      title: status === "approved" ? "Aapki photo approve ho gayi" : "Aapki photo approve nahi hui",
      message:
        status === "approved"
          ? "Aapki photo ab gaon ki Gallery me sabko dikh rahi hai."
          : `Aapki photo reject hui. Karan: ${photo.rejectionReason}`.slice(0, 500),
      type: "general",
      link: "/citizen/photos",
    });

    return res.status(200).json({ success: true, message: `Photo ${status}`, data: { photo } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotos,
  getMyPhotos,
  getAllPhotosAdmin,
  uploadPhotos,
  deletePhoto,
  reviewPhoto,
};