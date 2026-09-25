const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Village name is required"],
      trim: true,
      maxlength: [100, "Village name cannot exceed 100 characters"],
    },

    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      maxlength: [100, "District cannot exceed 100 characters"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"],
    },

    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
    },

    population: {
      type: Number,
      min: [0, "Population cannot be negative"],
      default: 0,
    },

    area: {
      type: Number, // in sq km
      min: [0, "Area cannot be negative"],
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
        caption: { type: String, trim: true, maxlength: 200 },
      },
    ],

    // Key locations / places of interest
    places: [
      {
        name: { type: String, trim: true, maxlength: 100 },
        type: {
          type: String,
          enum: [
            "temple",
            "school",
            "hospital",
            "park",
            "market",
            "government_office",
            "water_body",
            "other",
          ],
          default: "other",
        },
        description: { type: String, trim: true, maxlength: 500 },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
    ],

    // Gram Panchayat head / Sarpanch
    sarpanch: {
      name: { type: String, trim: true, maxlength: 100 },
      phone: {
        type: String,
        trim: true,
        match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
      },
      since: { type: Date },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
villageSchema.index({ name: "text", district: "text", state: "text" });

const Village = mongoose.model("Village", villageSchema);

module.exports = Village;
