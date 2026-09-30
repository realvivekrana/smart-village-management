const express = require("express");
const router = express.Router();

const {
  getNotices, getManageNotices, getMyNotices, getNoticeById,
  createNotice, updateNotice, reviewNotice, deleteNotice,
} = require("../controllers/noticeController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { submissionLimiter } = require("../middleware/rateLimitMiddleware");
const {
  createNoticeValidator, updateNoticeValidator, reviewValidator,
} = require("../validators/noticeValidator");

router.get("/", getNotices);
// fixed paths must stay above "/:id"
router.get("/manage", protect, authorize("admin"), getManageNotices);
router.get("/mine", protect, getMyNotices);
router.get("/:id", optionalAuth, getNoticeById);

// any logged-in user can submit; citizens' notices wait for admin approval
router.post("/", protect, submissionLimiter, createNoticeValidator, validate, createNotice);
// admin can edit any notice; a citizen can edit only their own (checked in the controller)
router.put("/:id", protect, updateNoticeValidator, validate, updateNotice);
router.patch("/:id/review", protect, authorize("admin"), reviewValidator, validate, reviewNotice);
router.delete("/:id", protect, deleteNotice);

module.exports = router;