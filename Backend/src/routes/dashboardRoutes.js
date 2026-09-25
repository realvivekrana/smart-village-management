const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getCitizenDashboard,
  getBusinessOwnerDashboard,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/citizen", protect, getCitizenDashboard);
router.get("/business-owner", protect, authorize("business_owner", "admin"), getBusinessOwnerDashboard);

module.exports = router;
