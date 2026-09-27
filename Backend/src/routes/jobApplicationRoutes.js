const express = require("express");
const router = express.Router();

const {
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/jobApplicationController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Mounted at /api/v1/applications
// (apply / view-applications-for-a-job now live in jobRoutes.js, under /api/v1/jobs)

// Citizen's own applications
router.get("/my", protect, getMyApplications);

// Update / withdraw application
router.patch("/:id/status", protect, authorize("citizen", "admin"), updateApplicationStatus);
router.delete("/:id", protect, withdrawApplication);

module.exports = router;