const express = require("express");

const router = express.Router();

const {
  getPhotos,
  getMyPhotos,
  getAllPhotosAdmin,
  uploadPhotos,
  deletePhoto,
  reviewPhoto,
} = require("../controllers/galleryController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");

// Public: sirf approved photos
router.get("/", getPhotos);

// Logged-in
router.get("/my", protect, getMyPhotos);
router.post("/", protect, uploadMultipleImages("images", 5), uploadPhotos);

// Admin
router.get("/admin/all", protect, authorize("admin"), getAllPhotosAdmin);
router.patch("/:id/review", protect, authorize("admin"), reviewPhoto);

// Owner / admin
router.delete("/:id", protect, deletePhoto);

module.exports = router;