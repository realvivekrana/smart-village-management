const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 5,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["new", "read", "replied", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ email: 1 });

module.exports = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);