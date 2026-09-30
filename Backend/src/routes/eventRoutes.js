const express = require("express");
const router = express.Router();

const {
  getEvents, getManageEvents, getMyEvents, getEventById,
  createEvent, updateEvent, reviewEvent, deleteEvent, toggleInterested,
} = require("../controllers/eventController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { submissionLimiter } = require("../middleware/rateLimitMiddleware");
const {
  createEventValidator, updateEventValidator, reviewEventValidator,
} = require("../validators/eventValidator");

router.get("/", getEvents);
// fixed paths must stay above "/:id"
router.get("/manage", protect, authorize("admin"), getManageEvents);
router.get("/mine", protect, getMyEvents);
router.get("/:id", optionalAuth, getEventById);

// any logged-in user can post an event; it is published immediately (admin can moderate later)
router.post("/", protect, submissionLimiter, uploadMultipleImages("images", 4), createEventValidator, validate, createEvent);
// admin can edit any event; a citizen can edit only their own (checked in the controller)
router.put("/:id", protect, updateEventValidator, validate, updateEvent);
router.patch("/:id/review", protect, authorize("admin"), reviewEventValidator, validate, reviewEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/:id/interested", protect, toggleInterested);

module.exports = router;