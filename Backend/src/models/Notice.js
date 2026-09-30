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
          "government",
          "education",
          "health",
          "agriculture",
          "employment",
          "social",
          "emergency",
          "general",
          "infrastructure",
          "water",
          "electricity",
          "sanitation",
          "disaster",
          "government_scheme",
          "other",
        ],
        message: "Invalid notice category",
      },
      default: "general",
    },

    priority: {
      type: String,
      enum: {
        values: [
          "urgent",
          "high",
          "normal",
          "low",
        ],
        message: "Invalid notice priority",
      },
      default: "normal",
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    attachments: [
      {
        name: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },

        publicId: {
          type: String,
          trim: true,
        },

        type: {
          type: String,
          trim: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    // Citizen submissions start as "pending" and need admin approval.
    // Old documents without this field are treated as approved.
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
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

/*
|--------------------------------------------------------------------------
| Validate Expiry Date
|--------------------------------------------------------------------------
*/

noticeSchema.pre("validate", function (next) {
  if (
    this.expiresAt &&
    this.publishedAt &&
    this.expiresAt < this.publishedAt
  ) {
    this.invalidate(
      "expiresAt",
      "Expiry date must be after published date"
    );
  }

  next();
});

/*
|--------------------------------------------------------------------------
| Virtual: Is Expired
|--------------------------------------------------------------------------
*/

noticeSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) {
    return false;
  }

  return new Date() > this.expiresAt;
});

/*
|--------------------------------------------------------------------------
| JSON / Object Virtuals
|--------------------------------------------------------------------------
*/

noticeSchema.set("toJSON", {
  virtuals: true,
});

noticeSchema.set("toObject", {
  virtuals: true,
});

/*
|--------------------------------------------------------------------------
| PERFORMANCE INDEX
|--------------------------------------------------------------------------
|
| Homepage query:
|
| isActive: true
| expiresAt >= currentDate OR expiresAt = null
| sort publishedAt DESC
|
|--------------------------------------------------------------------------
*/

noticeSchema.index({
  isActive: 1,
  publishedAt: -1,
});

/*
|--------------------------------------------------------------------------
| Category + Date
|--------------------------------------------------------------------------
*/

noticeSchema.index({
  category: 1,
  isActive: 1,
  publishedAt: -1,
});

/*
|--------------------------------------------------------------------------
| Priority + Date
|--------------------------------------------------------------------------
|
| Notices page / dashboard ke liye useful.
|--------------------------------------------------------------------------
*/

noticeSchema.index({
  priority: 1,
  isActive: 1,
  publishedAt: -1,
});

/*
|--------------------------------------------------------------------------
| Text Search
|--------------------------------------------------------------------------
*/

noticeSchema.index({ createdBy: 1, createdAt: -1 });
noticeSchema.index({ status: 1, createdAt: -1 });

noticeSchema.index({
  title: "text",
  content: "text",
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Notice = mongoose.model(
  "Notice",
  noticeSchema
);

module.exports = Notice;