const express = require("express");
const router = express.Router();

const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { createNoticeValidator, updateNoticeValidator } = require("../validators/noticeValidator");

router.get("/", getNotices);
router.get("/:id", getNoticeById);
router.post("/", protect, authorize("admin"), createNoticeValidator, validate, createNotice);
router.put("/:id", protect, authorize("admin"), updateNoticeValidator, validate, updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

module.exports = router;
