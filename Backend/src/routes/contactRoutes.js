const express = require("express");

const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Contact Form
|--------------------------------------------------------------------------
| POST /api/v1/contact
*/
router.post("/", createContactMessage);

/*
|--------------------------------------------------------------------------
| Admin Contact Messages
|--------------------------------------------------------------------------
| GET    /api/v1/contact
| GET    /api/v1/contact/:id
| PATCH  /api/v1/contact/:id/status
| DELETE /api/v1/contact/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  authorize("admin"),
  getContactMessages
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getContactMessageById
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateContactMessageStatus
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteContactMessage
);

module.exports = router;