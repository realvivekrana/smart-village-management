const CommunityPost = require("../models/CommunityPost");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/community  (public)
|--------------------------------------------------------------------------
*/
const getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .populate("createdBy", "name avatar")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { posts },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/community/:id  (public)
|--------------------------------------------------------------------------
*/
const getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .lean();
    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/community/my  (protected)
|--------------------------------------------------------------------------
*/
const getMyPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { createdBy: req.user._id, isActive: true };

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CommunityPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { posts },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/community  (protected)
|--------------------------------------------------------------------------
*/
const createPost = async (req, res, next) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/community");
    }

    const post = await CommunityPost.create({
      content: req.body.content,
      category: req.body.category,
      images,
      createdBy: req.user._id,
    });

    await post.populate("createdBy", "name avatar");

    return res.status(201).json({ success: true, message: "Post created", data: { post } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/community/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const updatePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || !post.isActive) return res.status(404).json({ success: false, message: "Post not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(post.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (req.body.content) post.content = req.body.content;
    if (req.body.category) post.category = req.body.category;
    if (isAdmin && req.body.isPinned !== undefined) post.isPinned = req.body.isPinned;

    await post.save();
    return res.status(200).json({ success: true, message: "Post updated", data: { post } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/community/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(post.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Delete images
    if (post.images.length > 0) {
      const ids = post.images.map((i) => i.publicId).filter(Boolean);
      await cloudinaryService.deleteMultipleImages(ids);
    }

    post.isActive = false;
    await post.save();

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/community/:id/like  (protected)
|--------------------------------------------------------------------------
*/
const toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || !post.isActive) return res.status(404).json({ success: false, message: "Post not found" });

    const userId = req.user._id;
    const liked = post.likes.some((id) => String(id) === String(userId));

    if (liked) {
      post.likes.pull(userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
    }

    await post.save();
    return res.status(200).json({
      success: true,
      message: liked ? "Like removed" : "Post liked",
      data: { liked: !liked, likeCount: post.likeCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};