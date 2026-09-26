const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Reusable Sub Schemas
|--------------------------------------------------------------------------
*/

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "Village",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    type: {
      type: String,
      default: "other",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    distanceKm: {
      type: Number,
      min: 0,
      default: null,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    coordinates: {
      lat: {
        type: Number,
        default: null,
      },

      lng: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const nearbySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    distanceKm: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const contactSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const sarpanchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const howToReachSchema = new mongoose.Schema(
  {
    road: {
      type: String,
      default: "",
      trim: true,
    },

    rail: {
      type: String,
      default: "",
      trim: true,
    },

    air: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const coordinatesSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      default: null,
    },

    lng: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Village Schema
|--------------------------------------------------------------------------
*/

const villageSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: [true, "Village name is required"],
      trim: true,
      maxlength: 150,
    },

    localName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 10000,
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

    /*
    |--------------------------------------------------------------------------
    | Administrative Information
    |--------------------------------------------------------------------------
    */

    block: {
      type: String,
      trim: true,
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

    stdCode: {
      type: String,
      trim: true,
      default: "",
    },

    altitude: {
      type: Number,
      min: 0,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Population / Area
    |--------------------------------------------------------------------------
    */

    population: {
      type: Number,
      min: 0,
      default: 0,
    },

    area: {
      type: Number,
      min: 0,
      default: null,
    },

    establishedYear: {
      type: Number,
      min: 0,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */

    contact: {
      type: contactSchema,
      default: () => ({}),
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Sarpanch
    |--------------------------------------------------------------------------
    */

    sarpanch: {
      type: sarpanchSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Demographic / Geographic Information
    |--------------------------------------------------------------------------
    */

    languages: {
      type: [String],
      default: [],
    },

    rivers: {
      type: [String],
      default: [],
    },

    assemblyConstituency: {
      type: String,
      trim: true,
      default: "",
    },

    lokSabhaConstituency: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | How To Reach
    |--------------------------------------------------------------------------
    */

    howToReach: {
      type: howToReachSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    location: {
      type: coordinatesSchema,
      default: () => ({}),
    },

    // Compatibility with older frontend/backend fields
    coordinates: {
      type: coordinatesSchema,
      default: () => ({}),
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Village Facilities
    |--------------------------------------------------------------------------
    */

    facilities: {
      type: [String],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Village Places / Directory
    |--------------------------------------------------------------------------
    */

    places: {
      type: [placeSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Nearby Locations
    |--------------------------------------------------------------------------
    */

    nearbyVillages: {
      type: [nearbySchema],
      default: [],
    },

    nearbyCities: {
      type: [nearbySchema],
      default: [],
    },

    nearbyTaluks: {
      type: [nearbySchema],
      default: [],
    },

    nearbyDistricts: {
      type: [nearbySchema],
      default: [],
    },

    nearbyRailwayStations: {
      type: [nearbySchema],
      default: [],
    },

    nearbyAirports: {
      type: [nearbySchema],
      default: [],
    },

    nearbyTouristPlaces: {
      type: [nearbySchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Images / Gallery
    |--------------------------------------------------------------------------
    */

    image: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Active Village
    |--------------------------------------------------------------------------
    */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

villageSchema.index({
  name: 1,
});

villageSchema.index({
  district: 1,
  state: 1,
});

villageSchema.index({
  isActive: 1,
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model(
  "Village",
  villageSchema
);