const express = require("express");
const router = express.Router();

const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", protect, authorize("admin"), createService);
router.put("/:id", protect, authorize("admin"), updateService);
router.delete("/:id", protect, authorize("admin"), deleteService);

module.exports = router;
