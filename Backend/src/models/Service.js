const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: [3, "Service name must be at least 3 characters"],
      maxlength: [150, "Service name cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "certificate",
          "license",
          "utility",
          "health",
          "education",
          "social_welfare",
          "agriculture",
          "land_records",
          "infrastructure",
          "other",
        ],
        message: "Invalid category",
      },
      required: [true, "Category is required"],
    },

    // How to avail the service
    howToApply: {
      type: String,
      trim: true,
      maxlength: [2000, "How to apply cannot exceed 2000 characters"],
    },

    requiredDocuments: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],

    fees: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "INR" },
      isFree: { type: Boolean, default: true },
    },

    processingTime: {
      type: String,
      trim: true,
      maxlength: [100, "Processing time cannot exceed 100 characters"],
    },

    contactInfo: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      officeAddress: { type: String, trim: true },
    },

    // Official portal link
    onlineLink: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ name: "text", description: "text" });
serviceSchema.index({ category: 1, isActive: 1 });

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
