const express = require("express");

const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// POST /api/v1/contact
router.post(
  "/",
  createContactMessage
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// GET /api/v1/contact
router.get(
  "/",
  protect,
  adminOnly,
  getContactMessages
);

// GET /api/v1/contact/:id
router.get(
  "/:id",
  protect,
  adminOnly,
  getContactMessageById
);

// PATCH /api/v1/contact/:id/status
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateContactMessageStatus
);

// DELETE /api/v1/contact/:id
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteContactMessage
);

module.exports = router;