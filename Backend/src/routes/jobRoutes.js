const express = require("express");
const router = express.Router();

const {
  getJobs,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const {
  applyForJob,
  getJobApplications,
} = require("../controllers/jobApplicationController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { createJobValidator, updateJobValidator } = require("../validators/jobValidator");
const { applyJobValidator } = require("../validators/jobValidator");

router.get("/", getJobs);
router.get("/my", protect, authorize("citizen", "admin"), getMyJobs);
router.get("/:id", getJobById);
router.post("/", protect, authorize("citizen", "admin"), createJobValidator, validate, createJob);
router.put("/:id", protect, authorize("citizen", "admin"), updateJobValidator, validate, updateJob);
router.delete("/:id", protect, authorize("citizen", "admin"), deleteJob);

// Job applications, nested under a specific job (mounted at /api/v1/jobs)
router.post("/:jobId/apply", protect, uploadResume, applyJobValidator, validate, applyForJob);
router.get("/:jobId/applications", protect, authorize("citizen", "admin"), getJobApplications);

module.exports = router;