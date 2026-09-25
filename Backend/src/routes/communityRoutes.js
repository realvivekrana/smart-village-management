const express = require("express");
const router = express.Router();

const {
  getPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} = require("../controllers/communityController");

const { protect } = require("../middleware/authMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");

router.get("/", getPosts);
router.get("/my", protect, getMyPosts);
router.get("/:id", getPostById);
router.post("/", protect, uploadMultipleImages("images", 3), createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);

module.exports = router;
