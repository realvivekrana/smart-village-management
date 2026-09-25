const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getBusinessReviews,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Nested under /api/v1/businesses/:businessId/reviews
router.get("/", getBusinessReviews);
router.post("/", protect, createReview);

// Standalone review actions (mounted at /api/v1/reviews)
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/respond", protect, authorize("business_owner"), respondToReview);

module.exports = router;
