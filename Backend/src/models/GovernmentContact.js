const mongoose = require("mongoose");

const governmentContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Emergency",
        "District Administration",
        "Block Administration",
        "Panchayat",
        "Police",
        "Health",
        "Education",
        "Agriculture",
        "Electricity",
        "Water Supply",
        "Transport",
        "Legal",
        "Government Services",
        "Other",
      ],
      default: "Other",
    },

    office: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
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

    address: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    isEmergency: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    source: {
      type: String,
      trim: true,
      default: "",
    },

    lastVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
governmentContactSchema.index({
  name: "text",
  designation: "text",
  department: "text",
  office: "text",
});

governmentContactSchema.index({
  category: 1,
  isActive: 1,
  displayOrder: 1,
});

governmentContactSchema.index({
  isEmergency: 1,
  isActive: 1,
});

governmentContactSchema.index({
  isFeatured: 1,
  isActive: 1,
});

/**
 * Normalize phone numbers before saving
 */
governmentContactSchema.pre("save", function (next) {
  if (this.phone) {
    this.phone = this.phone.trim();
  }

  if (this.alternatePhone) {
    this.alternatePhone = this.alternatePhone.trim();
  }

  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

module.exports = mongoose.model(
  "GovernmentContact",
  governmentContactSchema
);