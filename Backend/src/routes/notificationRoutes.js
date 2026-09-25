const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.delete("/", protect, clearAllNotifications);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
