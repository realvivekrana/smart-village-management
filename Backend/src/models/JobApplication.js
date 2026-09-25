const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
    },

    resume: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      fileName: { type: String, trim: true },
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
        message: "Invalid application status",
      },
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin note cannot exceed 1000 characters"],
    },

    // Prevent duplicate applications
  },
  {
    timestamps: true,
  }
);

// One application per job per user
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ applicant: 1, createdAt: -1 });
jobApplicationSchema.index({ job: 1, status: 1 });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

module.exports = JobApplication;
