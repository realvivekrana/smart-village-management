const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: [true, "Post reference is required"],
    },

    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Nested reply support (one level deep)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    likeCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ createdBy: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
