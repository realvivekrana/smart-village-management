const express = require("express");
const router = express.Router();

const {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} = require("../controllers/emergencyController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", getEmergencyContacts);
router.post("/", protect, authorize("admin"), createEmergencyContact);
router.put("/:id", protect, authorize("admin"), updateEmergencyContact);
router.delete("/:id", protect, authorize("admin"), deleteEmergencyContact);

module.exports = router;
