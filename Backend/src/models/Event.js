const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "cultural",
          "religious",
          "sports",
          "health",
          "education",
          "agriculture",
          "government",
          "environment",
          "social",
          "other",
        ],
        message: "Invalid category",
      },
      default: "other",
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },

    organizer: {
      type: String,
      trim: true,
      maxlength: [100, "Organizer name cannot exceed 100 characters"],
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    // Interested / attending users (simple count, not full list for privacy)
    attendeeCount: {
      type: Number,
      default: 0,
    },

    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    maxAttendees: {
      type: Number,
      default: null, // null = unlimited
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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

// Validate endDate is after startDate
eventSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
  next();
});

eventSchema.virtual("isUpcoming").get(function () {
  return new Date() < this.startDate;
});

eventSchema.virtual("isOngoing").get(function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

eventSchema.index({ startDate: 1, isActive: 1 });
eventSchema.index({ category: 1, isActive: 1 });
eventSchema.index({ title: "text", description: "text" });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
