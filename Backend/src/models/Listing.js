const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Listing (Gaon Bazaar)
|--------------------------------------------------------------------------
| Citizen ki daali hui: Khareed-Bikri, Khoya-Paya, Kheti saman Kiraya.
| Admin approve kare tabhi sabko dikhti hai.
*/

const listingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["buy-sell", "lost-found", "equipment-rental"],
        message: "Invalid listing type",
      },
      required: [true, "Listing type is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1500, "Description cannot exceed 1500 characters"],
      default: "",
    },

    // buy-sell: bechne wala saman | lost-found: lost / found | rental: available
    itemStatus: {
      type: String,
      enum: ["available", "lost", "found"],
      default: "available",
    },

    price: { type: Number, min: 0, default: null },

    priceUnit: {
      type: String,
      enum: ["fixed", "hour", "day", "week", "trip", "other"],
      default: "fixed",
    },

    location: { type: String, trim: true, maxlength: 200, default: "" },

    contactName: { type: String, trim: true, maxlength: 100, default: "" },

    contactPhone: {
      type: String,
      trim: true,
      required: [true, "Contact phone is required"],
      match: [/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"],
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    // Sold / Mil gaya / Kiraye pe chala gaya -> owner band kar sakta hai
    isClosed: { type: Boolean, default: false },

    // ---- Admin approval ----
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

listingSchema.index({ status: 1, isActive: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("Listing", listingSchema);