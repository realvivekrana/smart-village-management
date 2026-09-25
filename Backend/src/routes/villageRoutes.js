const express = require("express");
const router = express.Router();

const {
  getVillage,
  createVillage,
  updateVillage,
  uploadVillageImages,
} = require("../controllers/villageController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");

router.get("/", getVillage);
router.post("/", protect, authorize("admin"), createVillage);
router.put("/:id", protect, authorize("admin"), updateVillage);
router.post("/:id/images", protect, authorize("admin"), uploadMultipleImages("images", 5), uploadVillageImages);

module.exports = router;
