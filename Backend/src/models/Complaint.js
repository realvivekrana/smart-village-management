const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected", "closed"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "road",
          "water",
          "electricity",
          "sanitation",
          "health",
          "education",
          "agriculture",
          "security",
          "noise",
          "environment",
          "other",
        ],
        message: "Invalid category",
      },
      required: [true, "Category is required"],
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected", "closed"],
      default: "pending",
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    location: {
      type: String,
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },

    // Timeline tracks every status change
    timeline: [timelineEntrySchema],

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Submitter is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin note cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set resolvedAt when status becomes "resolved"
complaintSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

complaintSchema.index({ submittedBy: 1, createdAt: -1 });
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ title: "text", description: "text" });

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
