const Comment = require("../models/Comment");
const CommunityPost = require("../models/CommunityPost");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const notificationService = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| GET /api/v1/community/:postId/comments  (public)
|--------------------------------------------------------------------------
*/
const getComments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
      post: req.params.postId,
      parentComment: null,
      isActive: true,
    };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("createdBy", "name avatar")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { comments },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/community/:postId/comments  (protected)
|--------------------------------------------------------------------------
*/
const createComment = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.create({
      post: post._id,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
      createdBy: req.user._id,
    });

    // Increment commentCount on post
    await CommunityPost.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    // Notify post author (non-blocking)
    notificationService.notifyNewComment(post.createdBy, req.user, post).catch(() => {});

    await comment.populate("createdBy", "name avatar");

    return res.status(201).json({ success: true, message: "Comment added", data: { comment } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/comments/:id  (owner)
|--------------------------------------------------------------------------
*/
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || !comment.isActive) return res.status(404).json({ success: false, message: "Comment not found" });

    if (String(comment.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    comment.content = req.body.content;
    await comment.save();

    return res.status(200).json({ success: true, message: "Comment updated", data: { comment } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/comments/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(comment.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    comment.isActive = false;
    await comment.save();

    await CommunityPost.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 },
    });

    return res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/comments/:id/like  (protected)
|--------------------------------------------------------------------------
*/
const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || !comment.isActive) return res.status(404).json({ success: false, message: "Comment not found" });

    const userId = req.user._id;
    const liked = comment.likes.some((id) => String(id) === String(userId));

    if (liked) {
      comment.likes.pull(userId);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
    }

    await comment.save();
    return res.status(200).json({
      success: true,
      message: liked ? "Like removed" : "Comment liked",
      data: { liked: !liked, likeCount: comment.likeCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment, toggleCommentLike };