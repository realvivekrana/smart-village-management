const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "Business reference is required"],
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    // Owner response to the review
    ownerResponse: {
      content: { type: String, trim: true, maxlength: 1000 },
      respondedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per business
reviewSchema.index({ business: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ business: 1, isActive: 1 });
reviewSchema.index({ reviewer: 1 });

// Update business rating when a review is saved or deleted
// This is handled in the reviewController after creating/deleting

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
