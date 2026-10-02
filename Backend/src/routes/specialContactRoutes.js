const express = require("express");

const router = express.Router();

const {
  getSpecialContacts,
  getAllSpecialContacts,
  getSpecialContactMeta,
  createSpecialContact,
  updateSpecialContact,
  updateSpecialContactStatus,
  deleteSpecialContact,
} = require("../controllers/specialContactController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public — only active contacts
router.get("/", getSpecialContacts);

// Admin only (keep these above "/:id" routes)
router.get("/admin/all", protect, authorize("admin"), getAllSpecialContacts);
router.get("/admin/meta", protect, authorize("admin"), getSpecialContactMeta);

router.post("/", protect, authorize("admin"), createSpecialContact);
router.put("/:id", protect, authorize("admin"), updateSpecialContact);
router.patch("/:id/status", protect, authorize("admin"), updateSpecialContactStatus);
router.delete("/:id", protect, authorize("admin"), deleteSpecialContact);

module.exports = router;