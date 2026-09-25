const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters"],
      maxlength: [150, "Business name cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: [
          "grocery",
          "restaurant",
          "medical",
          "hardware",
          "clothing",
          "electronics",
          "agriculture",
          "dairy",
          "transport",
          "education",
          "beauty",
          "repair",
          "other",
        ],
        message: "Invalid category",
      },
      required: [true, "Category is required"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      street: { type: String, trim: true, maxlength: 200 },
      village: { type: String, trim: true, maxlength: 100 },
      district: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      pincode: { type: String, trim: true },
    },

    openingHours: {
      monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, isClosed: { type: Boolean, default: true } },
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
        caption: { type: String, trim: true, maxlength: 200 },
        isMain: { type: Boolean, default: false },
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Rating aggregates (updated when reviews are added/removed)
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({ name: "text", description: "text", tags: "text" });
businessSchema.index({ category: 1, status: 1, isActive: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ "rating.average": -1 });

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
