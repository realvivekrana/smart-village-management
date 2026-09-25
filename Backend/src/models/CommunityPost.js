const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      minlength: [5, "Content must be at least 5 characters"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "general",
          "help",
          "sell",
          "buy",
          "lost_found",
          "announcement",
          "question",
          "event",
          "other",
        ],
        message: "Invalid category",
      },
      default: "general",
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

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

    commentCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
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

communityPostSchema.index({ createdBy: 1, createdAt: -1 });
communityPostSchema.index({ isActive: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, isActive: 1 });
communityPostSchema.index({ content: "text" });

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

module.exports = CommunityPost;
