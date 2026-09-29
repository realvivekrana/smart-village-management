const express = require("express");

const router = express.Router();

const {
  getListings,
  getMyListings,
  getAllListingsAdmin,
  createListing,
  updateListing,
  toggleClosed,
  deleteListing,
  reviewListing,
} = require("../controllers/listingController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");

// Public: sirf approved listings
router.get("/", getListings);

// Logged-in
router.get("/my", protect, getMyListings);
router.post("/", protect, uploadMultipleImages("images", 3), createListing);

// Admin (/:id se pehle rakhna zaroori hai)
router.get("/admin/all", protect, authorize("admin"), getAllListingsAdmin);
router.patch("/:id/review", protect, authorize("admin"), reviewListing);

// Owner / admin
router.put("/:id", protect, updateListing);
router.patch("/:id/close", protect, toggleClosed);
router.delete("/:id", protect, deleteListing);

module.exports = router;