
const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Person who triggered SOS
    // ------------------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    userName: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },

    userPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Emergency Type
    // ------------------------------------------------------------

    emergencyType: {
      type: String,
      enum: [
        "medical",
        "police",
        "fire",
        "accident",
        "women-safety",
        "child-safety",
        "animal",
        "natural-disaster",
        "other",
      ],
      default: "other",
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // ------------------------------------------------------------
    // Location
    // ------------------------------------------------------------

    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null,
      },

      accuracy: {
        type: Number,
        min: 0,
        default: null,
      },

      address: {
        type: String,
        trim: true,
        default: "",
      },

      villageName: {
        type: String,
        trim: true,
        default: "Kakarcholi",
      },

      landmark: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ------------------------------------------------------------
    // Emergency Contact Notification
    // ------------------------------------------------------------

    notifiedContacts: [
      {
        name: {
          type: String,
          trim: true,
          default: "",
        },

        phone: {
          type: String,
          trim: true,
          default: "",
        },

        type: {
          type: String,
          enum: [
            "admin",
            "ambulance",
            "police",
            "fire",
            "family",
            "other",
          ],
          default: "other",
        },

        notifiedAt: {
          type: Date,
          default: null,
        },

        notificationStatus: {
          type: String,
          enum: [
            "pending",
            "sent",
            "failed",
          ],
          default: "pending",
        },
      },
    ],

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------

    status: {
      type: String,
      enum: [
        "active",
        "acknowledged",
        "responding",
        "resolved",
        "cancelled",
        "false-alarm",
      ],
      default: "active",
      index: true,
    },

    // ------------------------------------------------------------
    // Admin Response
    // ------------------------------------------------------------

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    responseTeam: {
      type: String,
      trim: true,
      default: "",
    },

    responseContact: {
      type: String,
      trim: true,
      default: "",
    },

    responseMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // ------------------------------------------------------------
    // Emergency Numbers Used
    // ------------------------------------------------------------

    emergencyNumbers: {
      ambulance: {
        type: String,
        default: "108",
      },

      police: {
        type: String,
        default: "112",
      },

      fire: {
        type: String,
        default: "101",
      },

      nationalEmergency: {
        type: String,
        default: "112",
      },
    },

    // ------------------------------------------------------------
    // Village
    // ------------------------------------------------------------

    villageName: {
      type: String,
      trim: true,
      default: "Kakarcholi",
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

    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isTestAlert: {
      type: Boolean,
      default: false,
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

sosAlertSchema.index({
  user: 1,
  createdAt: -1,
});

sosAlertSchema.index({
  status: 1,
  createdAt: -1,
});

sosAlertSchema.index({
  emergencyType: 1,
  status: 1,
});

sosAlertSchema.index({
  villageName: 1,
  status: 1,
});

sosAlertSchema.index({
  "location.latitude": 1,
  "location.longitude": 1,
});

/*
|--------------------------------------------------------------------------
| Virtual: Is Active
|--------------------------------------------------------------------------
*/

sosAlertSchema.virtual("isActive").get(function () {
  return [
    "active",
    "acknowledged",
    "responding",
  ].includes(this.status);
});

/*
|--------------------------------------------------------------------------
| Virtual: Response Time
|--------------------------------------------------------------------------
*/

sosAlertSchema.virtual("responseTimeMinutes").get(
  function () {
    if (!this.createdAt || !this.acknowledgedAt) {
      return null;
    }

    const difference =
      new Date(this.acknowledgedAt).getTime() -
      new Date(this.createdAt).getTime();

    return Math.max(
      0,
      Math.round(difference / (1000 * 60))
    );
  }
);

/*
|--------------------------------------------------------------------------
| JSON / Object Settings
|--------------------------------------------------------------------------
*/

sosAlertSchema.set("toJSON", {
  virtuals: true,
});

sosAlertSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "SOSAlert",
  sosAlertSchema
);