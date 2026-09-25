const express = require("express");
const router = express.Router();

const {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/jobApplicationController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { applyJobValidator } = require("../validators/jobValidator");

// Citizen's own applications
router.get("/my", protect, getMyApplications);

// Apply for a job (nested under jobs)
router.post("/jobs/:jobId/apply", protect, uploadResume, applyJobValidator, validate, applyForJob);

// View applications for a job (owner / admin)
router.get("/jobs/:jobId/applications", protect, authorize("business_owner", "admin"), getJobApplications);

// Update / withdraw application
router.patch("/:id/status", protect, authorize("business_owner", "admin"), updateApplicationStatus);
router.delete("/:id", protect, withdrawApplication);

module.exports = router;
