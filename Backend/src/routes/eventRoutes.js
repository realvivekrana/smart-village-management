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
const {
  createEventValidator, updateEventValidator, reviewEventValidator,
} = require("../validators/eventValidator");

router.get("/", getEvents);
// fixed paths must stay above "/:id"
router.get("/manage", protect, authorize("admin"), getManageEvents);
router.get("/mine", protect, getMyEvents);
router.get("/:id", optionalAuth, getEventById);

// any logged-in user can submit; citizens' events wait for admin approval
router.post("/", protect, uploadMultipleImages("images", 4), createEventValidator, validate, createEvent);
router.put("/:id", protect, authorize("admin"), updateEventValidator, validate, updateEvent);
router.patch("/:id/review", protect, authorize("admin"), reviewEventValidator, validate, reviewEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/:id/interested", protect, toggleInterested);

module.exports = router;