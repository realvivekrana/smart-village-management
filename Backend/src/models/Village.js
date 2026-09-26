const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 150,
    },

    type: {
      type: String,
      enum: [
        "temple",
        "mosque",
        "church",
        "school",
        "college",
        "hospital",
        "health_center",
        "park",
        "market",
        "super_market",
        "government_office",
        "police_station",
        "railway_station",
        "bus_stop",
        "atm",
        "petrol_pump",
        "restaurant",
        "hotel",
        "cinema",
        "electronic_shop",
        "water_body",
        "tourist_place",
        "other",
      ],
      default: "other",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    distanceKm: {
      type: Number,
      min: 0,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    imageUrl: {
      type: String,
      trim: true,
    },

    sourceName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const nearbySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    distanceKm: {
      type: Number,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Village name is required"],
      trim: true,
      maxlength: 100,
    },

    localName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    block: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
    },

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    altitude: {
      type: Number,
      min: 0,
    },

    stdCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    population: {
      type: Number,
      min: 0,
      default: 0,
    },

    area: {
      type: Number,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    history: {
      type: String,
      trim: true,
      maxlength: 10000,
    },

    howToReach: {
      road: String,
      rail: String,
      air: String,
    },

    rivers: [
      {
        type: String,
        trim: true,
      },
    ],

    nearbyVillages: [nearbySchema],

    nearbyCities: [nearbySchema],

    nearbyTaluks: [nearbySchema],

    nearbyAirports: [nearbySchema],

    nearbyTouristPlaces: [nearbySchema],

    nearbyDistricts: [nearbySchema],

    nearbyRailwayStations: [nearbySchema],

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

        caption: {
          type: String,
          trim: true,
          maxlength: 200,
        },
      },
    ],

    places: [placeSchema],

    sarpanch: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      phone: {
        type: String,
        trim: true,
        match: [
          /^[6-9]\d{9}$/,
          "Please enter a valid Indian phone number",
        ],
      },

      since: {
        type: Date,
      },
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

villageSchema.index({
  name: "text",
  district: "text",
  state: "text",
  block: "text",
});

const Village = mongoose.model("Village", villageSchema);

module.exports = Village;