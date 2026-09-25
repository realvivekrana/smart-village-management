const express = require("express");
const router = express.Router();

const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  createComplaintValidator,
  updateComplaintStatusValidator,
} = require("../validators/complaintValidator");

router.get("/", protect, getComplaints);
router.get("/:id", protect, getComplaintById);
router.post(
  "/",
  protect,
  uploadMultipleImages("images", 3),
  createComplaintValidator,
  validate,
  createComplaint
);
router.patch("/:id/status", protect, authorize("admin"), updateComplaintStatusValidator, validate, updateComplaintStatus);
router.patch("/:id/assign", protect, authorize("admin"), assignComplaint);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
