const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Notice content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "general",
          "health",
          "education",
          "agriculture",
          "infrastructure",
          "water",
          "electricity",
          "sanitation",
          "disaster",
          "government_scheme",
          "other",
        ],
        message: "Invalid category",
      },
      default: "general",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    attachments: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
        fileName: { type: String, trim: true },
        fileType: { type: String, trim: true },
      },
    ],

    publishedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: is the notice currently valid (not expired)
noticeSchema.virtual("isValid").get(function () {
  if (!this.expiresAt) return true;
  return new Date() < this.expiresAt;
});

noticeSchema.set("toJSON", { virtuals: true });
noticeSchema.set("toObject", { virtuals: true });

// Index
noticeSchema.index({ title: "text", content: "text" });
noticeSchema.index({ isActive: 1, publishedAt: -1 });
noticeSchema.index({ category: 1, isActive: 1 });

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
