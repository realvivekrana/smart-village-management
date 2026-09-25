const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    type: {
      type: String,
      enum: {
        values: [
          "complaint_update",
          "job_application",
          "new_notice",
          "new_event",
          "new_job",
          "business_status",
          "community_like",
          "community_comment",
          "review",
          "system",
          "general",
        ],
        message: "Invalid notification type",
      },
      default: "general",
    },

    // Link to the relevant resource
    link: {
      type: String,
      trim: true,
      default: "",
    },

    // The referenced document (optional)
    refModel: {
      type: String,
      enum: [
        "Complaint",
        "Job",
        "JobApplication",
        "Notice",
        "Event",
        "Business",
        "CommunityPost",
        "Review",
        null,
      ],
      default: null,
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// When marking read, set readAt
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 days TTL

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
