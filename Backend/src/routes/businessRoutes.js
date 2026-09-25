const express = require("express");
const router = express.Router();

const {
  getBusinesses,
  getBusinessById,
  getMyBusiness,
  getAllBusinessesAdmin,
  createBusiness,
  updateBusiness,
  reviewBusiness,
  deleteBusiness,
} = require("../controllers/businessController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  createBusinessValidator,
  updateBusinessValidator,
  reviewBusinessValidator,
} = require("../validators/businessValidator");

router.get("/", getBusinesses);
router.get("/my", protect, authorize("business_owner", "admin"), getMyBusiness);
router.get("/admin/all", protect, authorize("admin"), getAllBusinessesAdmin);
router.get("/:id", optionalAuth, getBusinessById);
router.post("/", protect, authorize("business_owner", "admin"), uploadMultipleImages("images", 5), createBusinessValidator, validate, createBusiness);
router.put("/:id", protect, uploadMultipleImages("images", 5), updateBusinessValidator, validate, updateBusiness);
router.patch("/:id/review", protect, authorize("admin"), reviewBusinessValidator, validate, reviewBusiness);
router.delete("/:id", protect, deleteBusiness);

module.exports = router;
