
const mongoose = require("mongoose");

const villageFeatureSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Basic Information
    // ------------------------------------------------------------

    title: {
      type: String,
      required: [true, "Feature title is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    category: {
      type: String,
      required: [true, "Feature category is required"],
      enum: [
        "scheme",
        "gram-sabha",
        "bill-tax",
        "mandi",
        "weather",
        "crop-advice",
        "equipment-rental",
        "fertilizer-seed",
        "health-camp",
        "vaccination",
        "animal-health",
        "dairy",
        "transport",
        "lost-found",
        "buy-sell",
        "scholarship",
        "exam-alert",
        "skill-training",
        "volunteer",
        "notice",
        "other",
      ],
      index: true,
    },

    // ------------------------------------------------------------
    // Scheme / Application Information
    // ------------------------------------------------------------

    schemeName: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    eligibility: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    requiredDocuments: {
      type: [String],
      default: [],
    },

    applicationUrl: {
      type: String,
      trim: true,
      default: "",
    },

    helplineNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Meeting / Gram Sabha
    // ------------------------------------------------------------

    meetingDate: {
      type: Date,
      default: null,
    },

    meetingLocation: {
      type: String,
      trim: true,
      default: "",
    },

    agenda: {
      type: [String],
      default: [],
    },

    minutesUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Agriculture / Mandi
    // ------------------------------------------------------------

    cropName: {
      type: String,
      trim: true,
      default: "",
    },

    cropUnit: {
      type: String,
      trim: true,
      default: "quintal",
    },

    minPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    maxPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    modalPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    mandiName: {
      type: String,
      trim: true,
      default: "",
    },

    priceDate: {
      type: Date,
      default: null,
    },

    // ------------------------------------------------------------
    // Weather / Crop Advice
    // ------------------------------------------------------------

    weatherDate: {
      type: Date,
      default: null,
    },

    temperature: {
      type: Number,
      default: null,
    },

    humidity: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    rainfallChance: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    weatherCondition: {
      type: String,
      trim: true,
      default: "",
    },

    cropAdvice: {
      type: [String],
      default: [],
    },

    // ------------------------------------------------------------
    // Equipment Rental
    // ------------------------------------------------------------

    equipmentName: {
      type: String,
      trim: true,
      default: "",
    },

    equipmentType: {
      type: String,
      trim: true,
      default: "",
    },

    rentalRate: {
      type: Number,
      min: 0,
      default: null,
    },

    rentalUnit: {
      type: String,
      enum: [
        "hour",
        "day",
        "week",
        "trip",
        "unit",
        "other",
      ],
      default: "day",
    },

    ownerName: {
      type: String,
      trim: true,
      default: "",
    },

    ownerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    availableFrom: {
      type: Date,
      default: null,
    },

    availableTo: {
      type: Date,
      default: null,
    },

    // ------------------------------------------------------------
    // Fertilizer / Seed Availability
    // ------------------------------------------------------------

    shopName: {
      type: String,
      trim: true,
      default: "",
    },

    shopAddress: {
      type: String,
      trim: true,
      default: "",
    },

    productName: {
      type: String,
      trim: true,
      default: "",
    },

    stockQuantity: {
      type: Number,
      min: 0,
      default: null,
    },

    stockUnit: {
      type: String,
      trim: true,
      default: "unit",
    },

    price: {
      type: Number,
      min: 0,
      default: null,
    },

    // ------------------------------------------------------------
    // Health / Vaccination / Animal Health
    // ------------------------------------------------------------

    campDate: {
      type: Date,
      default: null,
    },

    campTime: {
      type: String,
      trim: true,
      default: "",
    },

    campLocation: {
      type: String,
      trim: true,
      default: "",
    },

    doctorName: {
      type: String,
      trim: true,
      default: "",
    },

    doctorPhone: {
      type: String,
      trim: true,
      default: "",
    },

    services: {
      type: [String],
      default: [],
    },

    vaccinationName: {
      type: String,
      trim: true,
      default: "",
    },

    targetAge: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Dairy / Milk Collection
    // ------------------------------------------------------------

    dairyName: {
      type: String,
      trim: true,
      default: "",
    },

    milkRate: {
      type: Number,
      min: 0,
      default: null,
    },

    milkUnit: {
      type: String,
      trim: true,
      default: "litre",
    },

    collectionTime: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Transport
    // ------------------------------------------------------------

    vehicleType: {
      type: String,
      trim: true,
      default: "",
    },

    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },

    route: {
      type: String,
      trim: true,
      default: "",
    },

    departureTime: {
      type: String,
      trim: true,
      default: "",
    },

    arrivalTime: {
      type: String,
      trim: true,
      default: "",
    },

    fare: {
      type: Number,
      min: 0,
      default: null,
    },

    // ------------------------------------------------------------
    // Scholarship / Exam / Training
    // ------------------------------------------------------------

    provider: {
      type: String,
      trim: true,
      default: "",
    },

    lastDate: {
      type: Date,
      default: null,
    },

    examDate: {
      type: Date,
      default: null,
    },

    resultDate: {
      type: Date,
      default: null,
    },

    courseName: {
      type: String,
      trim: true,
      default: "",
    },

    trainingProvider: {
      type: String,
      trim: true,
      default: "",
    },

    trainingDuration: {
      type: String,
      trim: true,
      default: "",
    },

    trainingStartDate: {
      type: Date,
      default: null,
    },

    trainingEndDate: {
      type: Date,
      default: null,
    },

    seats: {
      type: Number,
      min: 0,
      default: null,
    },

    registrationUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Volunteer / Shramdaan
    // ------------------------------------------------------------

    eventDate: {
      type: Date,
      default: null,
    },

    eventTime: {
      type: String,
      trim: true,
      default: "",
    },

    eventLocation: {
      type: String,
      trim: true,
      default: "",
    },

    volunteerLimit: {
      type: Number,
      min: 0,
      default: null,
    },

    // ------------------------------------------------------------
    // Lost & Found / Buy & Sell
    // ------------------------------------------------------------

    itemName: {
      type: String,
      trim: true,
      default: "",
    },

    itemDescription: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    itemStatus: {
      type: String,
      enum: [
        "lost",
        "found",
        "available",
        "sold",
        "closed",
      ],
      default: "available",
    },

    itemImage: {
      type: String,
      trim: true,
      default: "",
    },

    contactName: {
      type: String,
      trim: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------------------------------
    // Generic Feature Data
    // ------------------------------------------------------------

    image: {
      type: String,
      trim: true,
      default: "",
    },

    attachments: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ------------------------------------------------------------
    // Village / Location
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
    // Status / Visibility
    // ------------------------------------------------------------

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "inactive",
        "closed",
        "expired",
      ],
      default: "active",
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ------------------------------------------------------------
    // Created / Updated By
    // ------------------------------------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

villageFeatureSchema.index({
  title: "text",
  description: "text",
  schemeName: "text",
  cropName: "text",
  courseName: "text",
  itemName: "text",
});

villageFeatureSchema.index({
  category: 1,
  status: 1,
  isPublished: 1,
});

villageFeatureSchema.index({
  villageName: 1,
  category: 1,
});

villageFeatureSchema.index({
  lastDate: 1,
});

villageFeatureSchema.index({
  meetingDate: 1,
});

villageFeatureSchema.index({
  campDate: 1,
});

villageFeatureSchema.index({
  priceDate: 1,
});

/*
|--------------------------------------------------------------------------
| Virtual
|--------------------------------------------------------------------------
*/

villageFeatureSchema.virtual("isExpired").get(function () {
  const date =
    this.lastDate ||
    this.eventDate ||
    this.meetingDate ||
    this.campDate ||
    this.trainingEndDate;

  if (!date) {
    return false;
  }

  return new Date(date) < new Date();
});

/*
|--------------------------------------------------------------------------
| JSON Settings
|--------------------------------------------------------------------------
*/

villageFeatureSchema.set("toJSON", {
  virtuals: true,
});

villageFeatureSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "VillageFeature",
  villageFeatureSchema
);