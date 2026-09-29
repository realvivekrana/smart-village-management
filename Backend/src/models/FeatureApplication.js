const mongoose = require("mongoose");

const featureApplicationSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Applicant
    // ------------------------------------------------------------

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
      index: true,
    },

    applicantName: {
      type: String,
      trim: true,
      required: [true, "Applicant name is required"],
    },

    applicantPhone: {
      type: String,
      trim: true,
      default: "",
    },

    applicantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Feature
    // ------------------------------------------------------------

    feature: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VillageFeature",
      required: [true, "Village feature is required"],
      index: true,
    },

    category: {
      type: String,
      trim: true,
      required: [true, "Feature category is required"],
    },

    featureTitle: {
      type: String,
      trim: true,
      required: [true, "Feature title is required"],
    },

    // ------------------------------------------------------------
    // Application Type
    // ------------------------------------------------------------

    applicationType: {
      type: String,
      enum: [
        "scheme",
        "gram-sabha-rsvp",
        "scholarship",
        "skill-training",
        "health-camp",
        "vaccination",
        "equipment-rental",
        "fertilizer-seed",
        "volunteer",
        "lost-found",
        "buy-sell",
        "other",
      ],
      default: "other",
      index: true,
    },

    // ------------------------------------------------------------
    // Scheme / Application Details
    // ------------------------------------------------------------

    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      default: null,
    },

    householdDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    eligibilityDetails: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // ------------------------------------------------------------
    // Submitted Information
    // ------------------------------------------------------------

    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    documents: [
      {
        name: {
          type: String,
          trim: true,
          default: "",
        },

        url: {
          type: String,
          trim: true,
          default: "",
        },

        documentType: {
          type: String,
          trim: true,
          default: "",
        },

        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ------------------------------------------------------------
    // Application Tracking
    // ------------------------------------------------------------

    trackingId: {
      type: String,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "under-review",
        "documents-required",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "submitted",
      index: true,
    },

    statusMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // ------------------------------------------------------------
    // Admin Review
    // ------------------------------------------------------------

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminRemarks: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // ------------------------------------------------------------
    // Gram Sabha RSVP
    // ------------------------------------------------------------

    rsvp: {
      type: String,
      enum: [
        "pending",
        "attending",
        "not-attending",
      ],
      default: "pending",
    },

    rsvpAt: {
      type: Date,
      default: null,
    },

    // ------------------------------------------------------------
    // Notification Tracking
    // ------------------------------------------------------------

    notificationSent: {
      type: Boolean,
      default: false,
    },

    lastNotificationAt: {
      type: Date,
      default: null,
    },

    // ------------------------------------------------------------
    // Village
    // ------------------------------------------------------------

    villageName: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
    },

    // ------------------------------------------------------------
    // Additional Information
    // ------------------------------------------------------------

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Generate Tracking ID
|--------------------------------------------------------------------------
*/

featureApplicationSchema.pre(
  "validate",
  async function (next) {
    if (!this.trackingId) {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const timestamp = Date.now()
        .toString()
        .slice(-6);

      this.trackingId = `KAK-${timestamp}-${randomPart}`;
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

featureApplicationSchema.index({
  applicant: 1,
  createdAt: -1,
});

featureApplicationSchema.index({
  feature: 1,
  createdAt: -1,
});

featureApplicationSchema.index({
  status: 1,
  createdAt: -1,
});

featureApplicationSchema.index({
  category: 1,
  status: 1,
});

featureApplicationSchema.index({
  villageName: 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| JSON Settings
|--------------------------------------------------------------------------
*/

featureApplicationSchema.set("toJSON", {
  virtuals: true,
});

featureApplicationSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "FeatureApplication",
  featureApplicationSchema
);