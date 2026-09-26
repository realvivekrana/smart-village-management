const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Village name is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    population: {
      type: Number,
      min: 0,
      default: 0,
    },

    area: {
      type: String,
      trim: true,
      default: "",
    },

    establishedYear: {
      type: Number,
      min: 0,
      default: null,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    contact: {
      phone: {
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
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    history: {
      type: String,
      trim: true,
      default: "",
    },

    culture: {
      type: String,
      trim: true,
      default: "",
    },

    facilities: [
      {
        type: String,
        trim: true,
      },
    ],

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

villageSchema.index({
  name: 1,
});

villageSchema.index({
  district: 1,
  state: 1,
});

module.exports = mongoose.model("Village", villageSchema);