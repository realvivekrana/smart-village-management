const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

// Nested under /api/v1/community/:postId/comments
router.get("/", getComments);
router.post("/", protect, createComment);

// Standalone comment actions (mounted at /api/v1/comments)
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleCommentLike);

module.exports = router;
