const mongoose = require("mongoose");

const STATUSES = ["pending", "in_progress", "approved", "rejected", "cancelled"];

const CERTIFICATE_TYPES = [
  "residence",
  "income",
  "caste",
  "birth",
  "death",
  "character",
  "domicile",
  "no_dues",
  "other",
];

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, _id: true }
);

const certificateRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, unique: true, index: true },

    type: {
      type: String,
      enum: { values: CERTIFICATE_TYPES, message: "Invalid certificate type" },
      required: [true, "Certificate type is required"],
    },

    applicantName: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    fatherName: { type: String, trim: true, maxlength: 100 },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },

    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
      minlength: [10, "Purpose must be at least 10 characters"],
      maxlength: [500, "Purpose cannot exceed 500 characters"],
    },

    documents: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    status: { type: String, enum: STATUSES, default: "pending" },

    timeline: [timelineEntrySchema],

    adminNote: { type: String, trim: true, maxlength: 1000 },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Human friendly request number, e.g. CR-2026-000123
certificateRequestSchema.pre("validate", async function (next) {
  if (this.requestNumber) return next();
  try {
    const count = await this.constructor.countDocuments();
    const seq = String(count + 1).padStart(6, "0");
    this.requestNumber = `CR-${new Date().getFullYear()}-${seq}-${Math.floor(Math.random() * 90 + 10)}`;
    next();
  } catch (err) {
    next(err);
  }
});

certificateRequestSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    ["approved", "rejected"].includes(this.status) &&
    !this.processedAt
  ) {
    this.processedAt = new Date();
  }
  next();
});

certificateRequestSchema.index({ submittedBy: 1, createdAt: -1 });
certificateRequestSchema.index({ status: 1, type: 1 });

const CertificateRequest = mongoose.model("CertificateRequest", certificateRequestSchema);

module.exports = CertificateRequest;
module.exports.STATUSES = STATUSES;
module.exports.CERTIFICATE_TYPES = CERTIFICATE_TYPES;