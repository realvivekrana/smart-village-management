const express = require("express");

const router = express.Router();

const {
  getGovernmentContacts,
  createGovernmentContact,
  updateGovernmentContact,
  deleteGovernmentContact,
} = require("../controllers/governmentContactController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// -----------------------------------------------------------------------------
// Public
// Anyone can view government contacts
// -----------------------------------------------------------------------------
router.get("/", getGovernmentContacts);

// -----------------------------------------------------------------------------
// Admin only
// -----------------------------------------------------------------------------
router.post(
  "/",
  protect,
  authorize("admin"),
  createGovernmentContact
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateGovernmentContact
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteGovernmentContact
);

module.exports = router;