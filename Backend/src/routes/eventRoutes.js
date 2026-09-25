const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleInterested,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { createEventValidator, updateEventValidator } = require("../validators/eventValidator");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, authorize("admin"), uploadMultipleImages("images", 4), createEventValidator, validate, createEvent);
router.put("/:id", protect, authorize("admin"), updateEventValidator, validate, updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);
router.post("/:id/interested", protect, toggleInterested);

module.exports = router;
