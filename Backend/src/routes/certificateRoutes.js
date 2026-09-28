const express = require("express");
const router = express.Router();

const {
  getCertificateRequests,
  getCertificateRequestById,
  createCertificateRequest,
  updateCertificateStatus,
  cancelCertificateRequest,
  deleteCertificateRequest,
} = require("../controllers/certificateController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  createCertificateValidator,
  updateCertificateStatusValidator,
} = require("../validators/certificateValidator");

router.get("/", protect, getCertificateRequests);
router.get("/:id", protect, getCertificateRequestById);
router.post("/", protect, uploadMultipleImages("documents", 3), createCertificateValidator, validate, createCertificateRequest);
router.patch("/:id/status", protect, authorize("admin"), updateCertificateStatusValidator, validate, updateCertificateStatus);
router.patch("/:id/cancel", protect, cancelCertificateRequest);
router.delete("/:id", protect, deleteCertificateRequest);

module.exports = router;