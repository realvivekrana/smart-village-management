const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
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

    category: {
      type: String,
      enum: {
        values: [
          "police",
          "fire",
          "ambulance",
          "hospital",
          "electricity",
          "water",
          "panchayat",
          "disaster_relief",
          "women_helpline",
          "child_helpline",
          "other",
        ],
        message: "Invalid category",
      },
      required: [true, "Category is required"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    available24x7: {
      type: Boolean,
      default: false,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0, // For custom display ordering
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

emergencyContactSchema.index({ category: 1, isActive: 1 });
emergencyContactSchema.index({ order: 1 });

const EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema);

module.exports = EmergencyContact;
