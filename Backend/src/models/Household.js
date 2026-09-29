const mongoose = require("mongoose");

const householdMemberSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Member Basic Details
    // ------------------------------------------------------------

    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
      maxlength: 150,
    },

    relation: {
      type: String,
      required: [true, "Relation with household head is required"],
      trim: true,
      maxlength: 100,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
        "prefer-not-to-say",
      ],
      default: "prefer-not-to-say",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    age: {
      type: Number,
      min: 0,
      max: 120,
      default: null,
    },

    // ------------------------------------------------------------
    // Identity Details
    // ------------------------------------------------------------

    aadhaarLast4: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Aadhaar last 4 digits must be exactly 4 digits"],
      default: "",
    },

    voterId: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Contact
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Education / Occupation
    // ------------------------------------------------------------

    education: {
      type: String,
      trim: true,
      default: "",
    },

    occupation: {
      type: String,
      trim: true,
      default: "",
    },

    isStudent: {
      type: Boolean,
      default: false,
    },

    schoolOrCollege: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Government Scheme Information
    // ------------------------------------------------------------

    schemes: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    // ------------------------------------------------------------
    // Health Information
    // ------------------------------------------------------------

    bloodGroup: {
      type: String,
      enum: [
        "",
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
      default: "",
    },

    disability: {
      type: Boolean,
      default: false,
    },

    disabilityDetails: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Additional Details
    // ------------------------------------------------------------

    isPrimaryContact: {
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
    timestamps: true,
  }
);

const householdSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Household Owner / User
    // ------------------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Household user is required"],
      unique: true,
      index: true,
    },

    // ------------------------------------------------------------
    // Household Head
    // ------------------------------------------------------------

    householdHeadName: {
      type: String,
      required: [true, "Household head name is required"],
      trim: true,
      maxlength: 150,
    },

    householdHeadPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Address
    // ------------------------------------------------------------

    houseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    street: {
      type: String,
      trim: true,
      default: "",
    },

    ward: {
      type: String,
      trim: true,
      default: "",
    },

    villageName: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    panchayat: {
      type: String,
      trim: true,
      default: "",
    },

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
      default: "Jharkhand",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Household Details
    // ------------------------------------------------------------

    familyType: {
      type: String,
      enum: [
        "nuclear",
        "joint",
        "extended",
        "other",
      ],
      default: "nuclear",
    },

    houseType: {
      type: String,
      enum: [
        "kutcha",
        "semi-pucca",
        "pucca",
        "other",
      ],
      default: "other",
    },

    // ------------------------------------------------------------
    // Utility Information
    // ------------------------------------------------------------

    electricityConnection: {
      type: Boolean,
      default: false,
    },

    waterConnection: {
      type: Boolean,
      default: false,
    },

    toiletAvailable: {
      type: Boolean,
      default: false,
    },

    gasConnection: {
      type: Boolean,
      default: false,
    },

    internetAvailable: {
      type: Boolean,
      default: false,
    },

    // ------------------------------------------------------------
    // Agricultural Information
    // ------------------------------------------------------------

    isFarmer: {
      type: Boolean,
      default: false,
    },

    landArea: {
      type: Number,
      min: 0,
      default: null,
    },

    landUnit: {
      type: String,
      enum: [
        "acre",
        "hectare",
        "decimal",
        "other",
      ],
      default: "acre",
    },

    crops: {
      type: [String],
      default: [],
    },

    // ------------------------------------------------------------
    // Family Members
    // ------------------------------------------------------------

    members: {
      type: [householdMemberSchema],
      default: [],
    },

    // ------------------------------------------------------------
    // Household Documents / Certificates
    // ------------------------------------------------------------

    documents: [
      {
        documentType: {
          type: String,
          trim: true,
          default: "",
        },

        documentNumberLast4: {
          type: String,
          trim: true,
          default: "",
        },

        documentUrl: {
          type: String,
          trim: true,
          default: "",
        },

        verified: {
          type: Boolean,
          default: false,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ------------------------------------------------------------
    // Emergency Contact
    // ------------------------------------------------------------

    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContactRelation: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Village Reference
    // ------------------------------------------------------------

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
    },

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

householdSchema.index({
  villageName: 1,
  isActive: 1,
});

householdSchema.index({
  householdHeadName: "text",
  villageName: "text",
});

householdSchema.index({
  pincode: 1,
});

/*
|--------------------------------------------------------------------------
| Virtual - Total Family Members
|--------------------------------------------------------------------------
*/

householdSchema.virtual("totalMembers").get(function () {
  return Array.isArray(this.members)
    ? this.members.length
    : 0;
});

/*
|--------------------------------------------------------------------------
| Virtual - Adult Members
|--------------------------------------------------------------------------
*/

householdSchema.virtual("adultMembers").get(function () {
  if (!Array.isArray(this.members)) {
    return 0;
  }

  return this.members.filter(
    (member) =>
      typeof member.age === "number" &&
      member.age >= 18
  ).length;
});

/*
|--------------------------------------------------------------------------
| Virtual - Children
|--------------------------------------------------------------------------
*/

householdSchema.virtual("children").get(function () {
  if (!Array.isArray(this.members)) {
    return 0;
  }

  return this.members.filter(
    (member) =>
      typeof member.age === "number" &&
      member.age < 18
  ).length;
});

/*
|--------------------------------------------------------------------------
| JSON / Object Settings
|--------------------------------------------------------------------------
*/

householdSchema.set("toJSON", {
  virtuals: true,
});

householdSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "Household",
  householdSchema
);