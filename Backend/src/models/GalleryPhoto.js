const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| GalleryPhoto
|--------------------------------------------------------------------------
| Citizen ki upload ki hui gaon ki photo. Admin approve kare tabhi
| public Gallery me dikhti hai.
*/

const galleryPhotoSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true, trim: true },
      publicId: { type: String, trim: true, default: "" },
    },

    caption: { type: String, trim: true, maxlength: 200, default: "" },

    category: {
      type: String,
      enum: ["village", "festival", "farming", "event", "nature", "other"],
      default: "village",
    },

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

galleryPhotoSchema.index({ status: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("GalleryPhoto", galleryPhotoSchema);