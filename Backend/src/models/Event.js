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
        url: {
          type: String,
          trim: true,
        },

        publicId: {
          type: String,
          trim: true,
        },
      },
    ],

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
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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
| Validate Event Dates
|--------------------------------------------------------------------------
*/

eventSchema.pre("validate", function (next) {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    this.invalidate(
      "endDate",
      "End date must be after start date"
    );
  }

  next();
});

/*
|--------------------------------------------------------------------------
| Virtual: Is Upcoming
|--------------------------------------------------------------------------
*/

eventSchema.virtual("isUpcoming").get(function () {
  return new Date() < this.startDate;
});

/*
|--------------------------------------------------------------------------
| Virtual: Is Ongoing
|--------------------------------------------------------------------------
*/

eventSchema.virtual("isOngoing").get(function () {
  const now = new Date();

  return (
    now >= this.startDate &&
    now <= this.endDate
  );
});

/*
|--------------------------------------------------------------------------
| JSON / Object Virtuals
|--------------------------------------------------------------------------
*/

eventSchema.set("toJSON", {
  virtuals: true,
});

eventSchema.set("toObject", {
  virtuals: true,
});

/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
|
| IMPORTANT PERFORMANCE INDEX
|
| Homepage query:
|
| isActive = true
| endDate >= currentDate
| sort startDate ASC
|
| Isliye ye compound index add kiya gaya hai.
|--------------------------------------------------------------------------
*/

eventSchema.index({
  isActive: 1,
  startDate: 1,
  endDate: 1,
});

/*
|--------------------------------------------------------------------------
| Category Filtering
|--------------------------------------------------------------------------
*/

eventSchema.index({
  category: 1,
  isActive: 1,
});

/*
|--------------------------------------------------------------------------
| Featured Events
|--------------------------------------------------------------------------
*/

eventSchema.index({
  isFeatured: 1,
  isActive: 1,
  startDate: 1,
});

/*
|--------------------------------------------------------------------------
| Text Search
|--------------------------------------------------------------------------
*/

eventSchema.index({
  title: "text",
  description: "text",
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Event = mongoose.model(
  "Event",
  eventSchema
);

module.exports = Event;