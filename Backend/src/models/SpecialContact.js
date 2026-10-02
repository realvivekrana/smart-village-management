const mongoose = require("mongoose");

/**
 * Special Contact
 * ---------------------------------------------------------------
 * Admin can add ANY person useful to villagers (Mukhiya, Sachiv,
 * Ward Member, MLA, MP, ASHA, Teacher, Lineman ...).
 * `group` and `role` are free text so the admin is never limited
 * to a fixed list.
 */
const specialContactSchema = new mongoose.Schema(
  {
    // Optional only while the person is still "verification pending"
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      required: function () {
        return !this.isPending;
      },
    },

    // "person" = normal contact row, "place" = village / locality chip (no phone needed)
    kind: { type: String, enum: ["person", "place"], default: "person" },

    // Shows "Verification Pending" until the admin fills in the real name
    isPending: { type: Boolean, default: false },

    // Branch heading in the tree, e.g. Mukhiya, Pramukh, BDO, Panchayat Villages
    role: { type: String, required: true, trim: true, maxlength: 120 },

    // Top-level block on the public page, e.g. Kakarcholi Gram Panchayat, Jainagar Block
    group: { type: String, trim: true, default: "Other", maxlength: 80 },

    wardNumber: { type: String, trim: true, default: "", maxlength: 20 },
    area: { type: String, trim: true, default: "", maxlength: 160 },

    phone: { type: String, trim: true, default: "" },
    alternatePhone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },

    officeAddress: { type: String, trim: true, default: "", maxlength: 300 },
    availability: { type: String, trim: true, default: "", maxlength: 160 },
    about: { type: String, trim: true, default: "", maxlength: 600 },
    photo: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

specialContactSchema.index({ group: 1, isActive: 1, displayOrder: 1 });
specialContactSchema.index({ isFeatured: 1, isActive: 1 });
specialContactSchema.index({ name: "text", role: "text", group: "text", area: "text" });

module.exports = mongoose.model("SpecialContact", specialContactSchema);