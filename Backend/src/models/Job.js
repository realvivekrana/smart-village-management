const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    requirements: {
      type: String,
      trim: true,
      maxlength: [3000, "Requirements cannot exceed 3000 characters"],
    },

    company: {
      type: String,
      required: [true, "Company/Organization name is required"],
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "agriculture",
          "construction",
          "manufacturing",
          "retail",
          "health",
          "education",
          "it",
          "government",
          "domestic",
          "transportation",
          "other",
        ],
        message: "Invalid category",
      },
      default: "other",
    },

    type: {
      type: String,
      enum: ["full_time", "part_time", "contract", "seasonal", "internship"],
      default: "full_time",
    },

    salary: {
      min: { type: Number, min: 0, default: null },
      max: { type: Number, min: 0, default: null },
      currency: { type: String, default: "INR" },
      period: {
        type: String,
        enum: ["per_day", "per_week", "per_month", "per_year", "fixed"],
        default: "per_month",
      },
      isNegotiable: { type: Boolean, default: false },
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    openings: {
      type: Number,
      required: [true, "Number of openings is required"],
      min: [1, "Minimum 1 opening is required"],
      default: 1,
    },

    applyBy: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    applicationCount: {
      type: Number,
      default: 0,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by is required"],
    },

    // Optional: link to a Business
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.virtual("isOpen").get(function () {
  return this.isActive && new Date() < this.applyBy;
});

jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

jobSchema.index({ isActive: 1, applyBy: 1 });
jobSchema.index({ category: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ title: "text", description: "text", company: "text" });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
